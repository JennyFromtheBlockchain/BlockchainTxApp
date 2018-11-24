const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");

function processBlock(blockData, ticker) {
  var date = new Date(blockData.time);
  var nO = new network_obj(
    ticker,
    blockData.id,
    blockData.transaction_count,
    date.getTime()
  );
  var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
  var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, blockNumber, transactions, timestamp) values ('"
    + nO.blockchainTicker + "', '" + nO.blockNumber + "', '"
    + nO.transactions + "', '" + nO.timestamp + "');";
  service.persist(nO, selectQuery, insertQuery, null);
}

function callApi(url, ticker) {
  axios
    .get(url)
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      console.log(response);
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
    callApi("https://bitinfocharts.com/dash/explorer/", "dash");
    //callApi("https://api.blockchair.com/bitcoin-cash/blocks", "bch");
    //callApi("https://api.blockchair.com/ethereum/blocks", "eth");
    //callApi("https://api.blockchair.com/litecoin/blocks", "ltc");
  }
};
