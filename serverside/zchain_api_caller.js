const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");
const db = require("./db.js");
const blocksPerCall = 20;

function processBlock(blockData) {
    var date = new Date(blockData.timestamp);
    var zecNo = new network_obj(
      "zec",
      blockData.height,
      blockData.transactions,
      blockData.timestamp
    );
    var selectQuery = "select * from zec_network where blockNumber=" + zecNo.blockNumber + ";";
    var insertQuery = "insert ignore into zec_network(blockchainTicker, blockNumber, "
      + "transactions, timestamp) values ('" + zecNo.blockchainTicker + "', '"
      + zecNo.blockNumber + "', '" + zecNo.transactions + "', '" + zecNo.timestamp + "');";
    service.persist(zecNo, selectQuery, insertQuery);
  }

function getData() {
  var query = "select max(blockNumber) from zec_network;";
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    var maxBlockInDb = parseInt(service.getBlockNumberFromRowDataPacket(result));
    callApiForBlocks(maxBlockInDb);
  });
}
function callApiForBlocks(maxBlockInDb) {
  axios
    .get("https://api.zcha.in/v2/mainnet/blocks?sort=height&direction=descending&limit=" + blocksPerCall + "&offset=0")
    .then(response => {
      for (var i = 0; i < response.data.length; i++) {
        processBlock(response.data[i]);
      }
    })
    .catch(error => {
      console.log(error);
    });
}
module.exports = {
    getData: function() {
      //msleep(500);
      getData();
    }
};