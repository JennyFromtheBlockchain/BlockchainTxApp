var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "root",
	//password: "password",
	database: "transactions"
});

pool.getConnection(function(err, connection) {
	if(err)	{
		return console.log("error: " + err.message);
	}
	connection.query("select * from eth_network", function(err, result, fields) {
		if (err) throw err;	
		console.log(result);
	});
	
	connection.release();
});
