const service = require('./service.js');
const mysql = require("mysql");
const axios = require("axios");
const txInterval = 'hour';
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  //password: "password",
  database: "transactions"
});

class xrp_network_obj {
    constructor(blockchainTicker, transactions, timestamp) {
      this.blockchainTicker = blockchainTicker;
      this.txInterval = txInterval;
      this.transactions = transactions;
      this.timestamp = timestamp;
    }
  };

function processData(blockData) {
    var date = new Date(blockData.date);
    var time = Math.floor(parseInt(date.getTime()) / 1000);
    var xrpNO = new xrp_network_obj(
      "xrp",
      blockData.metric.transaction_count,
      time
    );
    var selectQuery = "select * from xrp_network where timestamp=" + xrpNO.timestamp
      + " and txInterval='" + txInterval + "';";
    var insertQuery = "insert ignore into xrp_network(blockchainTicker, txInterval, " 
      + "transactions, timestamp) values ('" + xrpNO.blockchainTicker + "', '"
      + xrpNO.txInterval + "', '" + xrpNO.transactions + "', '" + xrpNO.timestamp + "');";
    var updateQuery = "update xrp_network set transactions=" + xrpNO.transactions
      + " where txInterval='" + txInterval + "' and timestamp=" + xrpNO.timestamp + ";";
    service.persist(xrpNO, selectQuery, insertQuery, updateQuery);
  }

function getData() {
  pool.getConnection(function(err, connection) {
    if (err) {
      return console.log("error: " + err.message);
    }
    var query = "select max(timestamp) from xrp_network where txInterval='" + txInterval + "';";
    connection.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxTimestamp = parseInt(service.getBlockNumberFromRowDataPacket(result, "timestamp"));
      var curTimestamp = Math.floor(Date.now() / 1000);
      maxTimestamp = maxTimestamp == -1 ? curTimestamp - 3601 : maxTimestamp;
      callApiForData(maxTimestamp, curTimestamp);
    });
    connection.release();
  });
}
function callApiForData(startTime, endTime) {
  axios
    .get("https://data.ripple.com/v2/stats/?start=" + startTime + "&end=" + endTime + "&interval=" + txInterval)
    .then(response => {
      for (var i = 0; i < response.data.stats.length; i++) {
        processData(response.data.stats[i]);
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