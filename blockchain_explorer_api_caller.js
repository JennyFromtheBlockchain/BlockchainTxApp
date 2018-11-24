class network_obj {
  constructor(blockchainTicker, blockNumber, transactions, timestamp) {
    this.blockchainTicker = blockchainTicker;
    this.blockNumber = blockNumber;
    this.transactions = transactions;
    this.timestamp = timestamp;
  }
}

const sleep = require("sleep");
const axios = require("axios");
const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  //password: "password",
  database: "transactions"
});

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function persist(network_obj) {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var insertQuery =
      "select * from " +
      network_obj.blockchainTicker +
      "_network where blockNumber=" +
      network_obj.blockNumber +
      ";";
    connection.query(insertQuery, function(err, result, fields) {
      if (err) throw err;
      if (result.length == 0) {
        var insertQuery =
          "insert ignore into " +
          network_obj.blockchainTicker +
          "_network(blockchainTicker, blockNumber, transactions," +
          " timestamp) values ('" +
          network_obj.blockchainTicker +
          "', '" +
          network_obj.blockNumber +
          "', '" +
          network_obj.transactions +
          "', '" +
          network_obj.timestamp +
          "');";
        console.log(insertQuery);
        connection.query(insertQuery, function(err, result, fields) {
          if (err) throw err;
          console.log(result);
        });
      }
    });
    connection.release();
  });
}

function getBlockNumberFromRowDataPacket(result) {
  result = JSON.stringify(result[0]);
  result = result.replace('{"max(blockNumber)":', "");
  result = result.replace("}", "");
  if (isNaN(result)) return -1;
  return result;
}

function getTrxBlock(blockData) {
  var date = new Date(blockData.time);
  var trxNO = new network_obj(
    "trx",
    blockData.block_header.raw_data.number,
    blockData.transactions.length,
    blockData.block_header.raw_data.timestamp
  );
  persist(trxNO);
}

function getBlockchairBlock(blockData, ticker) {
  var date = new Date(blockData.time);
  var nO = new network_obj(
    ticker,
    blockData.id,
    blockData.transaction_count,
    date.getTime()
  );
  persist(nO);
}

function callBlockchairApi(url, ticker) {
  axios
    .get(url)
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      for (var i = 0; i < response.data.data.length; i++) {
        getBlockchairBlock(response.data.data[i], ticker);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

function getTrxData() {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(blockNumber) from trx_network;";
    connection.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxBlockInDb = parseInt(getBlockNumberFromRowDataPacket(result));
      callTrxApi(maxBlockInDb);
    });
    connection.release();
  });
}

function callTrxApi(maxBlockInDb) {
  axios
    .get("https://api.trongrid.io/wallet/getnowblock")
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      var blockHeight =
        parseInt(response.data.block_header.raw_data.number) + 1;
      maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
      blockHeight =
        maxBlockInDb + 30 < blockHeight ? maxBlockInDb + 30 : blockHeight;
      callTrxApiForBlocks(maxBlockInDb, blockHeight);
    })
    .catch(error => {
      console.log(error);
    });
}
function callTrxApiForBlocks(maxBlockInDb, blockHeight) {
  axios
    .get("https://api.trongrid.io/wallet/getblockbylimitnext", {
      params: {
        startNum: maxBlockInDb,
        endNum: blockHeight
      }
    })
    .then(response => {
      for (var i = 0; i < response.data.block.length; i++) {
        getTrxBlock(response.data.block[i]);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
    callBlockchairApi("https://api.blockchair.com/bitcoin/blocks", "btc");
    callBlockchairApi("https://api.blockchair.com/bitcoin-cash/blocks", "bch");
    callBlockchairApi("https://api.blockchair.com/ethereum/blocks", "eth");
    callBlockchairApi("https://api.blockchair.com/litecoin/blocks", "ltc");
    //msleep(500);
    getTrxData();
  }
};
