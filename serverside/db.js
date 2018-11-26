var mysql = require('mysql');

const connection = mysql.createConnection({
//const pool = mysql.createPool({
    //connectionLimit: 5,
    host: "localhost",
    user: "root",
    //password: "password",
    database: "transactions"
  });

connection.connect(function(err) {
    if (err) throw err;
});
// var connection;
// pool.getConnection(function(err, connection) {
//     if (err) {
//       return console.log("error: " + err.message);
//     }
//     this.connection = connection;
// });

module.exports = connection;