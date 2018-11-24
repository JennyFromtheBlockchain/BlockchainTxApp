class network_obj {
	constructor(blockchainTicker, blockNumber, transactions, timestamp){
	    this.blockchainTicker = blockchainTicker;	
	    this.blockNumber = blockNumber;
	    this.transactions = transactions;
	    this.timestamp = timestamp;
	}
};

var sleep = require('sleep');
const axios = require('axios');
const etherscanApiKey = "7MJ4F5M6WZFGYW5Q8VZP2613NTWHZTICQU";
var request = require("request");
var mysql = require("mysql");
var pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        //password: "password",
        database: "transactions"
});

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function persist(network_obj){
	pool.getConnection(function(err, connection) {
            if(err) {
                return console.log("error: " + err.message);
            }
	    var insertQuery = "select * from " + network_obj.blockchainTicker + "_network where blockNumber=" + network_obj.blockNumber + ";";
            connection.query(insertQuery, function(err, result, fields) {
                if (err) throw err;
	        if(result.length == 0)	{
	            var insertQuery = "insert ignore into " + network_obj.blockchainTicker + "_network(blockchainTicker, blockNumber, transactions," 			                      + " timestamp) values ('" + network_obj.blockchainTicker + "', '" + network_obj.blockNumber + "', '" 
				      + network_obj.transactions + "', '" + network_obj.timestamp + "');";
			console.log(insertQuery);
                        connection.query(insertQuery, function(err, result, fields) {
                            if (err) throw err;
               	            console.log(result);
        	    });
	    }
          });
        connection.release();
});
}

function getBlockNumberFromRowDataPacket(result) {
	result = JSON.stringify(result[0]);
	result = result.replace("{\"max(blockNumber)\":", "");
	result = result.replace("}", "");
	if(isNaN(result)) return -1;
	return result;
}

function getDataFromBody(body) {
	console.log("body: " + body);
	console.log("body.data.blocks: " + body.data.blocks);
	var blockNumber = body.data.blocks;
	request({
            url: "https://chain.so/api/v2/block/BTC/" + blockNumber,//"https://blockchain.info/latestblock",
            json: true
            }, function(error, response, body){
	        console.log("error: " + error);
                console.log("body: " + body);
	        console.log("body.data.block_number: " + body.data.block_no);
	        //if(!error && body.status == "success"){
                var bNO = new network_obj("btc", body.data.block_no, body.data.txs.length, body.data.time);	
                console.log(body.data.block_no);
                console.log(body.data.txs.length)
                console.log(body.data.time);
                persist(bNO);
                //}
        });
        //var bNO = new network_obj("btc", body.height, body.txIndexes.length, body.time);	
        //console.log(body.height);
        //console.log(body.txIndexes.length)
        //console.log(body.time);
        //persist(bNO);
}

function getEthBlock(blockNumber) {
	var ethUrl = "https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=" + blockNumber + 			   			     "&boolean=true&apikey=" + etherscanApiKey;
	request({
	        url: ethUrl,
	        json: true
	    }, function(error, response, body){
	        var eNO = new network_obj("eth", parseInt(blockNumber, 16), body.result.transactions.length, parseInt(body.result.timestamp, 16));
	        persist(eNO);
	    });
}

function getTrxBlocks(){
	pool.getConnection(function(err, connection) {
            if(err) {
                return console.log("error: " + err.message);
            }
	    var query = "select max(blockNumber) from trx_network;";
            connection.query(query, function(err, result, fields) {
                if (err) throw err;
		var maxBlockInDb = parseInt(getBlockNumberFromRowDataPacket(result));		

                request({
	            url: "https://api.trongrid.io/wallet/getnowblock",
	            json: true
	        }, function(error, response, body){
	            var blockHeight = parseInt(body.block_header.raw_data.number) + 1;
		    blockHeight = (maxBlockInDb + 30) < blockHeight ? maxBlockInDb + 30 : blockHeight;
	            request.post('https://api.trongrid.io/wallet/getblockbylimitnext', {
  	    	        json: {
                            "startNum": maxBlockInDb,
                            "endNum": blockHeight
  	                }
	            }, (error, res, body) => {
  	                if (error) {
    	                    console.error(error)
    	                    return;
  	                }
  	            for(var i = 0; i < body.block.length; i++) {	        
	                getTrxBlock(body.block[i]);
	            }
  	            console.log(`statusCode: ${res.statusCode}`);
		});
	        });
              });
	      connection.release();
	  });
}

function getTrxBlock(blockData) {
	var date = new Date(blockData.time);
	var trxNO = new network_obj("trx", blockData.block_header.raw_data.number, blockData.transactions.length,            				         blockData.block_header.raw_data.timestamp);
	persist(trxNO);
}


function getBlockchairBlock(blockData, ticker) {
	var date = new Date(blockData.time);
	var nO = new network_obj(ticker, blockData.id, blockData.transaction_count, date.getTime());
	persist(nO);
}

function callBlockchair(coin, ticker) {	
	    request({
	        url: "https://api.blockchair.com/" + coin + "/blocks",
	        json: true
	    }, function(error, response, body){
		if(!error){
		    for(var i = 0; i < body.data.length; i++) {
		        getBlockchairBlock(body.data[i], ticker);
                    }
		}
	    });
	}

module.exports = {
	getBtcData: function() {	
	    request({
	        url: "https://blockchain.info/latestblock",//"https://chain.so/api/v2/get_info/BTC",
	        json: true
	    }, function(error, response, body){
		if(!error){
		    //getDataFromBody(body);
		    var bNO = new network_obj("btc", body.height, body.txIndexes.length, body.time);
	            persist(bNO);
		}
	    });
	},
	getEthData: function() {	
	    request({
	        url: "https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=" + etherscanApiKey,
	        json: true
	    }, function(error, response, body){
	        getEthBlock(body.result);
	    });
	},
	getBchData: function() {	
	    request({
	        url: "https://api.blockchair.com/bitcoin-cash/blocks",
	        json: true
	    }, function(error, response, body){
		if(!error){
		    for(var i = 0; i < body.data.length; i++) {
		        getBlockchairBlock(body.data[i], "bch");
                    }
		}
	    });
	},
	getData: function() {	
	    callBlockchairApi("https://api.blockchair.com/bitcoin/blocks", "btc");
	    callBlockchairApi("https://api.blockchair.com/bitcoin-cash/blocks", "bch");
	    callBlockchairApi("https://api.blockchair.com/ethereum/blocks", "eth");
	    callBlockchairApi("https://api.blockchair.com/litecoin/blocks", "ltc");
            //msleep(500);
	    getTrxData();
	},
};

function callBlockchairApi(url, ticker){
	axios.get(url)
           .then(response => {
	       //console.log(Object.getOwnPropertyNames(response));
    	       for(var i = 0; i < response.data.data.length; i++) {
	           getBlockchairBlock(response.data.data[i], ticker);
               }
           })
           .catch(error => {
               console.log(error);
         });
}

function getTrxData() {
	pool.getConnection(function(err, connection) {
            if(err) {
                return console.log("error: " + err.message);
            }
	    var query = "select max(blockNumber) from trx_network;";
            connection.query(query, function(err, result, fields) {
                if (err) throw err;
		var maxBlockInDb = parseInt(getBlockNumberFromRowDataPacket(result));		
                callTrxApi(maxBlockInDb);
	    });
	    connection.release();
         });
}

function callTrxApi(maxBlockInDb){
	axios.get("https://api.trongrid.io/wallet/getnowblock")
           .then(response => {
	       //console.log(Object.getOwnPropertyNames(response));
	       var blockHeight = parseInt(response.data.block_header.raw_data.number) + 1;
	       maxBlockInDb = maxBlockInDb == -1 ? blockHeight - 30 : maxBlockInDb;
	       blockHeight = (maxBlockInDb + 30) < blockHeight ? maxBlockInDb + 30 : blockHeight;
	       callTrxApiForBlocks(maxBlockInDb, blockHeight);
           })
           .catch(error => {
               console.log(error);
         });
}
function callTrxApiForBlocks(maxBlockInDb, blockHeight){
	axios.get('https://api.trongrid.io/wallet/getblockbylimitnext', {
  	    params: {
                "startNum": maxBlockInDb,
                "endNum": blockHeight
            }
        })
           .then(response => {
	       for(var i = 0; i < response.data.block.length; i++) {	   
	           getTrxBlock(response.data.block[i]);
	       }
           })
           .catch(error => {
               console.log(error);
         });
	          
}