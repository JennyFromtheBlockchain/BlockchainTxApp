const db = require("./db.js");
const axios = require("axios");
const network_obj = require('./network_object');
const xrp_network_object = require('./xrp_network_object');
const xrpTxInterval = 'hour';

class blockchain_obj {
    constructor(blockchainsDbresult) {
      this.ticker = blockchainsDbresult.ticker;
      this.name = blockchainsDbresult.name;
      this.apiName = blockchainsDbresult.apiName;
      this.apiUrl = blockchainsDbresult.apiUrl;
      this.blockHeightApiUrl = blockchainsDbresult.blockHeightApiUrl;
    }
  };

function updateOrInsert(query) {
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

function checkIfExists(selectQuery, insertQuery, updateQuery) {
    console.log(selectQuery);
    db.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
          console.log(insertQuery);
          updateOrInsert(insertQuery);
        } else if(updateQuery != null) {
          console.log(updateQuery);
          updateOrInsert(updateQuery);
        }
    });
}

function processMinerGateResponse(blockData, ticker) {
    var date = new Date(blockData.data.time);
    var nO = new network_obj(
      ticker,
      blockData.data.height,
      blockData.data.txCount,
      blockData.data.timestamp
    );
    var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
    var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, "
      + "blockNumber, transactions, timestamp) values ('" + nO.blockchainTicker + "', '" 
      + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
    persist(selectQuery, insertQuery);
}
function processCoinExplorerResponse(blockData, ticker) {
    var date = new Date(blockData.data.result.time);
    var nO = new network_obj(
      ticker,
      blockData.data.result.height,
      blockData.data.result.tx.length,
      date.getTime()
    );
    var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
    var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, "
      + "blockNumber, transactions, timestamp) values ('" + nO.blockchainTicker + "', '" 
      + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
    persist(selectQuery, insertQuery);
  }

  function processBlockChairResponse(response, ticker) {
    response.data.data.forEach(data => {
        var date = new Date(data.time);
        var nO = new network_obj(
            ticker,
            data.id,
            data.transaction_count,
            date.getTime()
        );
        var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
        var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, "
        + "blockNumber, transactions, timestamp) values ('" + nO.blockchainTicker + "', '" 
        + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
        persist(selectQuery, insertQuery);
    });
}

function processDogeChainResponse(response, ticker) {
    var date = new Date(response.data.block.time);
    var nO = new network_obj(
      ticker,
      response.data.block.height,
      response.data.block.num_txs,
      response.data.block.time
    );
    var selectQuery = "select * from " + ticker + "_network where blockNumber=" + nO.blockNumber + ";";
    var insertQuery = "insert ignore into " + ticker + "_network(blockchainTicker, blockNumber, "
      + "transactions, timestamp) values ('" + nO.blockchainTicker + "', '"
      + nO.blockNumber + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
    persist(selectQuery, insertQuery);
}

function processRippleResponse(response) {
    response.data.stats.forEach(data => {
        var date = new Date(data.date);
        var time = Math.floor(parseInt(date.getTime()) / 1000);
        var nO = new xrp_network_object(
            "xrp",
            xrpTxInterval, 
            data.metric.transaction_count,
            time
        );
        var selectQuery = "select * from " + nO.blockchainTicker + "_network where timestamp=" + nO.timestamp
            + " and txInterval='" + xrpTxInterval + "';";
        var insertQuery = "insert ignore into " + nO.blockchainTicker + "_network(blockchainTicker, txInterval, " 
            + "transactions, timestamp) values ('" + nO.blockchainTicker + "', '"
            + nO.txInterval + "', '" + nO.transactions + "', '" + nO.timestamp + "');";
        var updateQuery = "update xrp_network set transactions=" + nO.transactions
            + " where txInterval='" + xrpTxInterval + "' and timestamp=" + nO.timestamp + ";";
        persist(selectQuery, insertQuery, updateQuery);
    })
}

function getRippleResponse(blockchainObj, ) {
    var query = "select max(timestamp) from xrp_network where txInterval='" + xrpTxInterval + "';";
    db.query(query, function(err, result, fields) {
      if (err) throw err;
      var maxTimestamp = parseInt(getBlockNumberFromRowDataPacket(result, "timestamp"));
      var curTimestamp = Math.floor(Date.now() / 1000);
      maxTimestamp = maxTimestamp == -1 ? curTimestamp - 3601 : maxTimestamp;
      var url = blockchainObj.apiUrl.replace("<startTime>", maxTimestamp).replace("<endTime>", curTimestamp).replace("<txInterval>", xrpTxInterval);
      callApi(url, blockchainObj.ticker, processRippleResponse);
    });
  }

function getDogeData(blockchainObj) {
    var query = "select max(blockNumber) from doge_network;";
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        var maxBlockInDb = parseInt(getBlockNumberFromRowDataPacket(result));
        callDogeApi(blockchainObj, maxBlockInDb);
    });
}

function callDogeApi(blockchainObj, maxBlockInDb) {
    axios
    .get(blockchainObj.blockHeightApiUrl.replace("<blockHeight>", ))
    .then(response => {
        //console.log(Object.getOwnPropertyNames(response));
        var blockHeight = parseInt(response.data);
        maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
        blockHeight = maxBlockInDb + 30 < blockHeight ? maxBlockInDb + 30 : blockHeight - 1;
        callApi(blockchainObj.apiUrl.replace("<blockHeight>", blockHeight), blockchainObj.ticker, processDogeChainResponse);
    })
    .catch(error => {
        console.log(error);
    });
}
  
function callApi(url, ticker, processResponseFunction) {
    axios
    .get(url)
    .then(response => {
        processResponseFunction(response, ticker);
    }).catch(error => {
        console.log(error);
    });
}
function persist(selectQuery, insertQuery) {
    this.persist(selectQuery, insertQuery, null);
}
function persist(selectQuery, insertQuery, updateQuery) {
    checkIfExists(selectQuery, insertQuery, updateQuery);
}

function createUrl(blockchainObj) {
    var url;
    switch(blockchainObj.apiName) {
        case "blockchair":
            url = blockchainObj.apiUrl.replace("<ticker>", blockchainObj.name);
            callApi(url, blockchainObj.ticker, processBlockChairResponse);
            break;
        break;
        case "coinexplorer":
            url = blockchainObj.apiUrl.replace("<ticker>", blockchainObj.ticker);
            callApi(url, blockchainObj.ticker, processCoinExplorerResponse);
            break;
        case "dogechain":
            getDogeData(blockchainObj);
            break;
        case "minergate":
            url = blockchainObj.apiUrl.replace("<ticker>", blockchainObj.ticker);
            callApi(url, blockchainObj.ticker, processMinerGateResponse);
            break;
        case "ripple":
            getRippleResponse(blockchainObj);
            break;
        case "zcha":
        
            break;
    }
}

function getBlockNumberFromRowDataPacket(packet, field) {
    packet = JSON.stringify(packet[0]);
    packet = packet.replace('{"max(' + field + ')":', "");
    packet = packet.replace("}", "");
    if (isNaN(packet)) return -1;
    return packet;
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

module.exports = {
    updateBlockchainData: function() {
        db.query("select * from blockchains;", function(err, result, fields) {
            if (err) throw err;
            //result.forEach(r => callApi(new blockchain_obj(r)));
            // createUrl(result[8]);
            // createUrl(result[2]);
            // createUrl(result[6]);
            // createUrl(result[7]);
            // createUrl(result[0]);
            // createUrl(result[1]);
            // createUrl(result[4]);
            // createUrl(result[5]);
            //  createUrl(result[3]);
            createUrl(result[9]);
        });
    }
};