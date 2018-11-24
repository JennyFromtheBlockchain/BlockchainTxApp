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
    var date = new Date(blockData.block.time);
    var dogeNO = new network_obj(
      "doge",
      blockData.block.height,
      blockData.block.num_txs,
      blockData.block.time
    );
    var selectQuery = "select * from doge_network where blockNumber=" + dogeNO.blockNumber + ";";
    var insertQuery = "insert ignore into doge_network(blockchainTicker, blockNumber, "
      + "transactions, timestamp) values ('" + dogeNO.blockchainTicker + "', '"
      + dogeNO.blockNumber + "', '" + dogeNO.transactions + "', '" + dogeNO.timestamp + "');";
    service.persist(dogeNO, selectQuery, insertQuery);
}

function getData() {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(blockNumber) from doge_network;";
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
    .get("https://dogechain.info/chain/Dogecoin/q/getblockcount")
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      var blockHeight =
        parseInt(response.data);
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
    .get("https://dogechain.info/api/v1/block/" + blockHeight)
    .then(response => {
        processBlock(response.data, "doge");
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