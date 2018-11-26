const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");

function processBlock(blockData, ticker) {
  var date = new Date(blockData.timestamp);
  var nO = new network_obj(
    ticker,
    blockData.number,
    blockData.transactions.length,
    blockData.timestamp
  );
  var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
  var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, "
    + "blockNumber, transactions, timestamp) values ('" + nO.blockchainTicker + "', '" 
    + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
  service.persist(nO, selectQuery, insertQuery);
}

function callApi(url, ticker) {
  axios
    .get(url)
    .then(response => {
        processBlock(response.data, ticker);
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
    callApi("https://api.vechain.tools/blocks/best", "vet");
  }
};