class eth_network_obj {
//const eNO = new eth_network_obj(1, 100, "2018-11-01T07:24:46.000Z");
	constructor(blockNumber, transactions, timestamp){
   	    this.blockNumber = blockNumber;
	    this.transactions = transactions;
	    this.timestamp = timestamp;
	}
};

const async = require('async');
var mysql = require('mysql');
var database = require('./database.js');
var Web3 = require('web3');
var web3 = new Web3('http://52.208.46.161:8546');//'https://api.myetherapi.com/eth');//'http://localhost:8545');
//var contract = new web3.eth.Contract(abi, address);
//var batch = new web3.BatchRequest();
//batch.add(web3.eth.getBalance.request('0xd551234ae421e3bcba99a0da6d736074f22192ff', 'latest', testMethod));
//batch.add(contract.methods.balance(address).call.request({from: '0xd551234ae421e3bcba99a0da6d736074f22192ff'}, testMethod));

//batch.execute();

var transactionsLast5Sec = 0;
var lastTime = (new Date).getTime();
var latestBlockNumber = -1;
var mysql = require('mysql');
const eNO = new eth_network_obj();

var pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        //password: "password",
        database: "transactions"
});

function getBlockNumberFromRowDataPacket(result) {
	result = JSON.stringify(result[0]);
	result = result.replace("{\"min(blockNumber)\":", "");	
//	result = result.replace("{\"max(blockNumber)\":", "");
	result = result.replace("}", "");
	if(isNaN(result)) return -1;
	return result;
}

function getBlockTransactionCount(blockNumber)	{
	console.log("blockNumber[" + blockNumber +"]");
	console.log("latestBlockNumberbeore[" + latestBlockNumber +"]");
	//not needed below when it's live, also should use a subscribe to get new blocks mined
	if(latestBlockNumber == -1) {
	    latestBlockNumber = blockNumber - 1;
	} else {
	    latestBlockNumber--;
	}
	console.log("latestBlockNumberafter[" + latestBlockNumber +"]");
	console.log("blockNumber[" + blockNumber +"]");
	if(blockNumber != latestBlockNumber)	{
	    eNO.blockNumber = latestBlockNumber;
	    console.log("blockNumber[" + eNO.blockNumber +"]");
	    web3.eth.getBlockTransactionCount(eNO.blockNumber).then(updateTransactionsDb);
	    //eNO.blockNumber = blockNumber;
	    //console.log("blockNumber[" + blockNumber +"]");
	    //web3.eth.getBlockTransactionCount(blockNumber).then(updateTransactionsDb);
	}
}

function updateTransactionsDb(transactions){
	console.log("actul txs: " + transactions);
	eNO.transactions = transactions;
	eNO.timestamp = new Date().toISOString().slice(0, 19).replace('T',' ');
	console.log(eNO);
	database.persist(eNO);
}

function persist(eth_network_obj1){
	pool.getConnection(function(err, connection) {
        if(err) {
            return console.log("error: " + err.message);
        }
	var insertQuery = "insert ignore into eth_network(blockNumber, transactions, timestamp)" 
			   + " values ('" + eth_network_obj1.blockNumber + "', '" + eth_network_obj1.transactions + "', '" 
		           + eth_network_obj1.timestamp + "')";
        connection.query(insertQuery, function(err, result, fields) {
            if (err) throw err;
            console.log(result);
        });
	
        connection.release();
});
}

module.exports = {
	getBlockNumber: function()	{
	    // setLatestBlockNumber
	    pool.getConnection(function(err, connection) {
                if(err) {
                    return console.log("error: " + err.message);
                }
	        var query = "select min(blockNumber) from eth_network";
	        //var query = "select max(blockNumber) from eth_network";
                connection.query(query, function(err, result, fields) {
                    if (err) throw err;
		    latestBlockNumber = getBlockNumberFromRowDataPacket(result);
                    console.log("latestBlockNumber: " + latestBlockNumber);
                });
                connection.release();
	    });
            web3.eth.getBlockNumber().then(getBlockTransactionCount);
	}
}
//var interval = setInterval(function(){
//	getBlockNumber();
//	console.log("Transactions in last 5 seconds [" + transactionsLast5Sec +"]");
//}, 250);

//var syncing = web3.eth.syncing;
//console.log(syncing);

//res.send('Ethereum\nLast mined block hash: ' + getBlockHash() +'\nTransactions within last block: ' + getBlockTxs());
//res.send('Ethereum\rLast mined block hash: ' + testMethod(web3.eth.getBlockNumber().then(testMethod)));

//TODO: I need to get a real node running to connect to and pull the latest blocks.
// Subscribe to blocks being mined so i dont have to just call it every 5 seconds and icnrease the blockNumber by one,
// Extract the blockNumber time of mining

