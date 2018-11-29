const express = require('express');
const app = express();
const db = require('../db.js');
const path = require('path');
const indexPath = "../../../ui/txtracker/index.html";
const selectQueryTemplate = "select * from <blockchainTicker>_network where blockNumber=<blockNumber>;";
const selectQueryByTimeFrameTemplate = "select * from <blockchainTicker>_network where timestamp>=<startTime> and timestamp<=<endTime>;";

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.listen(3000, function () {
    console.log('App listening on port 3000!');
  });

//
// -------- Endpoints -----------
//
app.get('/', function(req, res) {
    res.send("Shill tool 0.1!");
    //res.sendFile(path.join(__dirname + indexPath));
})

app.get('/all', function(req, res) {
    getAllBlockchainsData(res);
})

app.get('/:ticker/', function (req, res) {
    var blockchainTicker = req.params.ticker;
    let startTime = req.query.startTime;
    let endTime = req.query.endTime;
    getBlockchainData(res, blockchainTicker, startTime, endTime);
});
//
// -------- End -----------
//

function getAllBlockchainsData(res) {
    var query = "select * from blockchains;";
    queryDb(query, res)
}

function getBlockchainData(res, blockchainTicker, startTime, endTime) {
        var selectQuery = selectQueryByTimeFrameTemplate.replace("<blockchainTicker>", blockchainTicker)
            .replace("<startTime>", startTime).replace("<endTime>", endTime);
        queryDb(selectQuery, res);
}

function queryDb(query, res) {
    console.log(query);
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        res.send(result);
    });
}