const db = require("./db.js");
const axios = require("axios");
const network_obj = require('./network_object');
const xrp_network_object = require('./xrp_network_object');
const xrpTxInterval = 'hour';
const zecBlocksPerCall = '20';
const selectQueryTemplate = "select * from <blockchainTicker>_network where blockNumber=<blockNumber>;";
const insertQueryTemplate = "insert ignore into <blockchainTicker>_network(blockchainTicker, blockNumber, "
    + "transactions, timestamp) values ('<blockchainTicker>', '<blockNumber>', '<transactions>', '<timestamp>');";

function createSelectQuery(nO) {
    return selectQueryTemplate.replace("<blockchainTicker>", nO.blockchainTicker)
        .replace("<blockNumber>", nO.blockNumber);
}
function createInsertQuery(nO) {
    return insertQueryTemplate.replace("<blockchainTicker>", nO.blockchainTicker)
        .replace("<blockchainTicker>", nO.blockchainTicker)
        .replace("<blockNumber>", nO.blockNumber).replace("<transactions>", nO.transactions)
        .replace("<timestamp>", nO.timestamp);
}

function processMinerGateResponse(response, ticker) {
    var nO = new network_obj(
        ticker,
        response.data.height,
        response.data.txCount,
        response.data.timestamp
      );
      persist(createSelectQuery(nO), createInsertQuery(nO));
}

function processCoinExplorerResponse(response, ticker) {
    var date = new Date(response.data.result.time);
    var nO = new network_obj(
      ticker,
      response.data.result.height,
      response.data.result.tx.length,
      date.getTime()
    );
    persist(createSelectQuery(nO), createInsertQuery(nO));
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
        persist(createSelectQuery(nO), createInsertQuery(nO));
    });
}

function processDogeChainResponse(response, ticker) {
    var nO = new network_obj(
      ticker,
      response.data.block.height,
      response.data.block.num_txs,
      response.data.block.time
    );
    persist(createSelectQuery(nO), createInsertQuery(nO));
}

function processZChainResponse(response, ticker) {
    response.data.forEach(data => {
        var nO = new network_obj(
            ticker,
            data.height,
            data.transactions,
            data.timestamp
        );
        persist(createSelectQuery(nO), createInsertQuery(nO));
    });
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
    });
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

function getBlockNumberFromRowDataPacket(packet, field) {
    packet = JSON.stringify(packet[0]);
    packet = packet.replace('{"max(' + field + ')":', "");
    packet = packet.replace("}", "");
    if (isNaN(packet)) return -1;
    return packet;
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
function updateOrInsert(query) {
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

function createUrl(blockchainObj) {
    switch(blockchainObj.apiName) {
        case "blockchair":
            callApi(blockchainObj.apiUrl, blockchainObj.ticker, processBlockChairResponse);
            break;
        break;
        case "coinexplorer":
            callApi(blockchainObj.apiUrl, blockchainObj.ticker, processCoinExplorerResponse);
            break;
        case "dogechain":
            getDogeData(blockchainObj);
            break;
        case "minergate":
            callApi(blockchainObj.apiUrl, blockchainObj.ticker, processMinerGateResponse);
            break;
        case "ripple":
            getRippleResponse(blockchainObj);
            break;
        case "zcha":
            // TODO: Here we could get the last block in db to then use in the url 
            //  e.g. blocksPrCall = latestBlockInExistance - lastBlockInDB
            url = blockchainObj.apiUrl.replace("<blocksPerCall>", zecBlocksPerCall);
            callApi(url, blockchainObj.ticker, processZChainResponse);
            break;
    }
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

module.exports = {
    updateBlockchainData: function() {
        db.query("select * from blockchains;", function(err, result, fields) {
            if (err) throw err;
            result.forEach(r => createUrl(r));
            //  createUrl(result[12]);
        });
    }
};