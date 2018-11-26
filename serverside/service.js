const db = require("./db.js");

function updateOrInsert(query) {
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

function checkIfExists(selectQuery, insertQuery, updateQuery) {
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

module.exports = {
    persist: function(network_obj, selectQuery, insertQuery) {
        this.persist(network_obj, selectQuery, insertQuery, null);
    },
    persist: function(network_obj, selectQuery, insertQuery, updateQuery) {
        checkIfExists(selectQuery, insertQuery, updateQuery);
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