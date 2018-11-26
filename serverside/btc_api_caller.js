class network_obj {
	constructor(blockchainTicker, blockNumber, transactions, timestamp){
	    this.blockchainTicker = blockchainTicker;	
	    this.blockNumber = blockNumber;
	    this.transactions = transactions;
	    this.timestamp = timestamp;
	}
};

var request = require("request");
var mysql = require("mysql");
var pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        //password: "password",
        database: "transactions"
});

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
	var ethUrl = "https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=" + blockNumber + 			   			     "&boolean=true&apikey=7MJ4F5M6WZFGYW5Q8VZP2613NTWHZTICQU";
	console.log(ethUrl);
	request({
	        url: ethUrl,
	        json: true
	    }, function(error, response, body){
		console.log(body.result);
		console.log(body.result.timestamp);
	        var eNO = new network_obj("eth", parseInt(blockNumber, 16), body.result.transactions.length, parseInt(body.result.timestamp, 16));	
	        console.log(blockNumber);
	        //console.log(body.txIndexes.length)
	        //console.log(body.time);
	        persist(eNO);
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
	            console.log(body.height);
	            console.log(body.txIndexes.length)
	            console.log(body.time);
	            persist(bNO);
		}
	    });
	},
	getEthData: function() {	
	    request({
	        url: "https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken7MJ4F5M6WZFGYW5Q8VZP2613NTWHZTICQU",
	        json: true
	    }, function(error, response, body){
	        getEthBlock(body.result);
	    });
	}
};
