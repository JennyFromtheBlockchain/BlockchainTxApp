const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  //password: "password",
  database: "transactions"
});

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

module.exports = {
    persist: function(network_obj) {
        pool.getConnection(function(err, connection) {
            if (err) {
              return console.log("error: " + err.message);
            }
            var insertQuery = "select * from " + network_obj.blockchainTicker +
              "_network where blockNumber=" + network_obj.blockNumber + ";";
            connection.query(insertQuery, function(err, result, fields) {
              if (err) throw err;
              if (result.length == 0) {
                var insertQuery = "insert ignore into " + network_obj.blockchainTicker
                + "_network(blockchainTicker, blockNumber, transactions, timestamp) values ('"
                + network_obj.blockchainTicker + "', '" + network_obj.blockNumber + "', '"
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
    },
    getBlockNumberFromRowDataPacket: function(packet) {
        packet = JSON.stringify(packet[0]);
        packet = packet.replace('{"max(blockNumber)":', "");
        packet = packet.replace("}", "");
        if (isNaN(packet)) return -1;
        return packet;
    }
};