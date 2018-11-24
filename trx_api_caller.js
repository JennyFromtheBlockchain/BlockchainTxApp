const service = require('./service.js');
const network_obj = require('./network_object');
const mysql = require("mysql");
const axios = require("axios");
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  //password: "password",
  database: "transactions"
});

function processTrxBlock(blockData) {
    var date = new Date(blockData.time);
    var trxNO = new network_obj(
      "trx",
      blockData.block_header.raw_data.number,
      blockData.transactions.length,
      blockData.block_header.raw_data.timestamp
    );
    service.persist(trxNO);
  }

function getTrxData() {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(blockNumber) from trx_network;";
    connection.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxBlockInDb = parseInt(service.getBlockNumberFromRowDataPacket(result));
      callTrx(maxBlockInDb);
    });
    connection.release();
  });
}

function callTrx(maxBlockInDb) {
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
        processTrxBlock(response.data.block[i]);
      }
    })
    .catch(error => {
      console.log(error);
    });
}
module.exports = {
    getData: function() {
      //msleep(500);
      getTrxData();
    }
};