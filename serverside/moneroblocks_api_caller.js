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

function processBlock(blockData) {
    var date = new Date(blockData.block_data.result.block_header.timestamp);
    var xmrNO = new network_obj(
      "xmr",
      blockData.block_data.result.block_header.depth,
      blockData.block_data.result.block_header.num_txs,
      blockData.block_data.result.block_header.timestamp
    );
    var selectQuery = "select * from xmr_network where blockNumber=" + xmrNO.blockNumber + ";";
    var insertQuery = "insert ignore into xmr_network(blockchainTicker, blockNumber, "
      + "transactions, timestamp) values ('" + dogeNO.blockchainTicker + "', '"
      + xmrNO.blockNumber + "', '" + xmrNO.transactions + "', '" + xmrNO.timestamp + "');";
    service.persist(xmrNO, selectQuery, insertQuery);
}

function getData() {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(blockNumber) from xmr_network;";
    connection.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxBlockInDb = parseInt(service.getBlockNumberFromRowDataPacket(result));
      callApi(maxBlockInDb);
    });
    connection.release();
  });
}

function callApi(maxBlockInDb) {
  axios
    .get("http://moneroblocks.info/api/get_stats/")
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      var blockHeight =
        parseInt(response.data.height);
      maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
      blockHeight =
        maxBlockInDb + 30 < blockHeight ? maxBlockInDb + 30 : blockHeight - 1;
      callApiForBlocks(maxBlockInDb, blockHeight);
    })
    .catch(error => {
      console.log(error);
    });
}
function callApiForBlocks(maxBlockInDb, blockHeight) {
  axios
    .get("http://moneroblocks.info/api/get_block_data/" + blockHeight)
    .then(response => {
        processBlock(response.data);
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