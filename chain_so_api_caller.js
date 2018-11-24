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

function processBlock(blockData, ticker) {
    var date = new Date(blockData.data.time);
    var nO = new network_obj(
      ticker,
      blockData.data.block_no,
      blockData.data.txs.length,
      blockData.data.time
    );
    service.persist(nO);
  }

function getData(ticker) {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(blockNumber) from " + ticker +"_network;";
    connection.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxBlockInDb = parseInt(service.getBlockNumberFromRowDataPacket(result));
      callApi(ticker, maxBlockInDb);
    });
    connection.release();
  });
}

function callApi(ticker, maxBlockInDb) {
  axios
    .get("https://chain.so/api/v2/get_info/" + ticker)
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      var blockHeight =
        parseInt(response.data.data.blocks);
      maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
      blockHeight =
        maxBlockInDb + 30 < blockHeight ? maxBlockInDb + 30 : blockHeight;
      callApiForBlocks(ticker, maxBlockInDb, blockHeight);
    })
    .catch(error => {
      console.log(error);
    });
}
function callApiForBlocks(ticker, maxBlockInDb, blockHeight) {
  axios
    .get("https://chain.so/api/v2/block/" + ticker + "/" + blockHeight)
    .then(response => {
        processBlock(response.data, ticker);
    })
    .catch(error => {
      console.log(error);
    });
}
module.exports = {
  getData: function() {
    getData("doge");
    getData("dash");
    getData("zec");
  }
};
