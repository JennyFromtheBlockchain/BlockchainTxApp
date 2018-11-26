const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  //password: "password",
  database: "transactions"
});

function updateOrInsert(connection, query) {
    connection.query(query, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

function checkIfExists(connection, selectQuery, insertQuery, updateQuery) {
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
          console.log(insertQuery);
          updateOrInsert(connection, insertQuery);
        } else if(updateQuery != null) {
          console.log(updateQuery);
          updateOrInsert(connection, updateQuery);
        }
      });
}

module.exports = {
    persist: function(network_obj, selectQuery, insertQuery) {
        this.persist(network_obj, selectQuery, insertQuery, null);
    },
    persist: function(network_obj, selectQuery, insertQuery, updateQuery) {
        pool.getConnection(function(err, connection) {
            if (err) {
              return console.log("error: " + err.message);
            }
            checkIfExists(connection, selectQuery, insertQuery, updateQuery);
            connection.release();
        });
    },
    getBlockNumberFromRowDataPacket: function(packet, field) {
        packet = JSON.stringify(packet[0]);
        packet = packet.replace('{"max(' + field + ')":', "");
        packet = packet.replace("}", "");
        if (isNaN(packet)) return -1;
        return packet;
    },
    msleep: function(n) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
      }
};