var mysql = require('mysql');
var pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        //password: "password",
        database: "transactions"
});

function getBlockNumberFromRowDataPacket(result) {
	result = JSON.stringify(result[0]);
	result = result.replace("{\"max(blockNumber)\":", "");
	result = result.replace("}", "");
	console.log("result ["+result+"]");
	if(isNaN(result)) return -1;
	console.log(result+"test");
	return result;
}
module.exports = {
 	getLatestBlockNumber: function() {	
	 	pool.getConnection(function(err, connection) {
        	if(err) {
                	return console.log("error: " + err.message);
       		}	
  	       var latestBlockNumber = connection.query("select max(blockNumber) from eth_network", function(err, result, fields) {
         	       if (err) throw err;
			console.log(result);
			var latestBlockNumber = getBlockNumberFromRowDataPacket(result);
			console.log("result 2 " + latestBlockNumber);
			return latestBlockNumber;
        	});
	        connection.release();
		console.log("latestBlockNumber[" + latestBlockNumber + "]");
		//return latestBlockNumber;
		});
	},
	persist: function(eth_network_obj1){
	 pool.getConnection(function(err, connection) {
       	  if(err) {
       	          return console.log("error: " + err.message);
         }
	 var insertQuery = "insert into eth_network(blockNumber, transactions, timestamp)" 
	 		   + " values ('" + eth_network_obj1.blockNumber + "', '" + eth_network_obj1.transactions + "', '" 
		           + eth_network_obj1.timestamp + "')";
         connection.query(insertQuery, function(err, result, fields) {
                 if (err) throw err;
                 console.log(result);
         });
         connection.release();
 });
}
}
