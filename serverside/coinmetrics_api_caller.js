const service = require('./service.js');
const axios = require("axios");
const db = require("./db.js");
class network_obj {
    constructor(blockchainTicker, transactions, timestamp) {
      this.blockchainTicker = blockchainTicker;
      this.txInterval = "day";
      this.transactions = transactions;
      this.timestamp = timestamp;
    }
};

const tickers = ["ae", "dcr", "xem", "xvg", "dgb", "btg", "ada", "lsk", "neo", "gas", "eos", "waves", "maid",
  "aion", "ant", "bat", "bnb", "btm", "cennz", "ctxc", "cvc", "drgn", "elf", "eng", "ethos", "fun", "gno",
  "gnt", "icn", "icx", "kcs", "knc", "loom", "lrc", "mana", "mtl", "nas", "omg", "pay", "poly", "powr", "ppt",
  "qash", "rep", "rhoc", "salt", "snt", "srn", "veri", "wtc", "zil", "zrx"];
const dayInSec = 86400;
function processBlock(blockData, ticker) {
  var date = new Date(blockData.timestamp);
  var nO = new network_obj(
    ticker,
    blockData[1],
    blockData[0]
  );
  var selectQuery = "select * from " + ticker + "_network where timestamp=" + nO.timestamp + " and txInterval='hour';";
  var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, txInterval, transactions, timestamp) "
    + "values ('" + nO.blockchainTicker + "', '" + nO.txInterval + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
  service.persist(nO, selectQuery, insertQuery);
}

function getData(ticker) {
  var query = "select max(timestamp) from " + ticker + "_network;";
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    var maxTimeStampInDb = parseInt(service.getBlockNumberFromRowDataPacket(result, "timestamp"));
    var curTime = Math.floor(new Date().getTime() / 1000);
    // If no records in db, get data from api from last 30 days
    maxTimeStampInDb = maxTimeStampInDb == -1 ? curTime - (30 * dayInSec) : maxTimeStampInDb + 1;

    if(maxTimeStampInDb + (2 * dayInSec) < curTime) {
        var url = "https://coinmetrics.io/api/v1/get_asset_data_for_time_range/" + ticker + "/txcount/"
              + maxTimeStampInDb + "/" + curTime;
        callApi(url, ticker);
    }
  });
}

function callApi(url, ticker) {
  axios
    .get(url)
    .then(response => {
        console.log(url)
        for(var i = 0; i < response.data.result.length; i++)    {
            processBlock(response.data.result[i], ticker);
        }
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getData: function() {
    tickers.forEach(t => getData(t));
  }
};