const service = require('./service.js');
const network_obj = require('./network_object');
const db = require("./db.js");
const axios = require("axios");

function processBlock(blockData) {
    var date = new Date(blockData.time);
    var trxNO = new network_obj(
      "trx",
      blockData.block_header.raw_data.number,
      blockData.transactions.length,
      blockData.block_header.raw_data.timestamp
    );
    var selectQuery = "select * from trx_network where blockNumber=" + trxNO.blockNumber + ";";
    var insertQuery = "insert ignore into trx_network(blockchainTicker, blockNumber,"
      + "transactions, timestamp) values ('" + trxNO.blockchainTicker + "', '" 
      + trxNO.blockNumber + "', '" + trxNO.transactions + "', '" + trxNO.timestamp + "');";
    service.persist(trxNO, selectQuery, insertQuery);
  }

function getData() {
  var query = "select max(blockNumber) from trx_network;";
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    var maxBlockInDb = parseInt(service.getBlockNumberFromRowDataPacket(result));
    callApi(maxBlockInDb);
  });
}

function callApi(maxBlockInDb) {
  axios
    .get("https://api.trongrid.io/wallet/getnowblock")
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      var blockHeight =
        parseInt(response.data.block_header.raw_data.number) + 1;
      maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
      blockHeight =
        maxBlockInDb + 30 < blockHeight ? maxBlockInDb + 30 : blockHeight;
      callApiForBlocks(maxBlockInDb, blockHeight);
    })
    .catch(error => {
      console.log(error);
    });
}
function callApiForBlocks(maxBlockInDb, blockHeight) {
  axios
    .get("https://api.trongrid.io/wallet/getblockbylimitnext", {
      params: {
        startNum: maxBlockInDb,
        endNum: blockHeight
      }
    })
    .then(response => {
      for (var i = 0; i < response.data.block.length; i++) {
        processBlock(response.data.block[i]);
      }
    })
    .catch(error => {
      console.log(error);
    });
}
module.exports = {
    getData: function() {
      getData();
    }
};