const service = require('./service.js');
const network_obj = require('./network_object');
const axios = require("axios");

function processBlockchairBlock(blockData, ticker) {
  var date = new Date(blockData.time);
  var nO = new network_obj(
    ticker,
    blockData.id,
    blockData.transaction_count,
    date.getTime()
  );
  service.persist(nO);
}

function callBlockchairApi(url, ticker) {
  axios
    .get(url)
    .then(response => {
      //console.log(Object.getOwnPropertyNames(response));
      for (var i = 0; i < response.data.data.length; i++) {
        processBlockchairBlock(response.data.data[i], ticker);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
    callBlockchairApi("https://api.blockchair.com/bitcoin/blocks", "btc");
    callBlockchairApi("https://api.blockchair.com/bitcoin-cash/blocks", "bch");
    callBlockchairApi("https://api.blockchair.com/ethereum/blocks", "eth");
    callBlockchairApi("https://api.blockchair.com/litecoin/blocks", "ltc");
  }
};
