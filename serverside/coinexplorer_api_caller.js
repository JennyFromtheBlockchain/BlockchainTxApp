const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");
const tickers = ["dash", "vtc", "piv"];//,["ltc"];
const coinexplorerUrl = "https://www.coinexplorer.net/api/v1/<ticker>/block/latest";

function processBlock(blockData, ticker) {
  var date = new Date(blockData.result.time);
  var nO = new network_obj(
    ticker,
    blockData.result.height,
    blockData.result.tx.length,
    date.getTime()
  );
  var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
  var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, "
    + "blockNumber, transactions, timestamp) values ('" + nO.blockchainTicker + "', '" 
    + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
  service.persist(nO, selectQuery, insertQuery);
}

function callApi(ticker) {
  axios
    .get(coinexplorerUrl.replace("<ticker>", ticker))
    .then(response => {
        processBlock(response.data, ticker);
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
    tickers.forEach(t => callApi(t));
    callApi("dash");
  }
};