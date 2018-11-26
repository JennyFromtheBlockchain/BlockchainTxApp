const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");

function processBlock(blockData, ticker) {
  var date = new Date(blockData.time);
  var nO = new network_obj(
    ticker,
    blockData.height,
    blockData.txCount,
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
      //console.log(Object.getOwnPropertyNames(response));
      //for (var i = 0; i < response.data.data.length; i++) {
        processBlock(response.data, ticker);
      //}
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
      //https://github.com/MinerGate/minergate-api
    callApi("https://api.minergate.com/1.0/xmr/status", "xmr");
    // callApi("https://api.blockchair.com/bitcoin-cash/blocks", "bch");
    // callApi("https://api.blockchair.com/ethereum/blocks", "eth");
    // callApi("https://api.blockchair.com/litecoin/blocks", "ltc");
  }
};