const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");
const blockChairUrl = "https://api.blockchair.com/<ticker>/blocks";
const coins = [ ["btc", "bitcoin"], ["bch", "bitcoin-cash"], ["eth", "ethereum"], ["ltc", "litecoin"]];

function processBlock(blockData, ticker) {
  var date = new Date(blockData.time);
  var nO = new network_obj(
    ticker,
    blockData.id,
    blockData.transaction_count,
    date.getTime()
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
      //console.log(Object.getOwnPropertyNames(response));
      for (var i = 0; i < response.data.data.length; i++) {
        processBlock(response.data.data[i], ticker);
      }
    })
    .catch(error => {
      console.log(error);
    });
}
module.exports = {
  getData: function() {
    coins.forEach(c => callApi(blockChairUrl.replace("<ticker>", c[1]), c[0]))
  }
};
