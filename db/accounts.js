var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var accounts;
module.exports = accounts = {};

accounts.listConfigs = function(cb) {
    gdb().collection("accounts", function(err, collection) {
        if (err) return cb(err);
        collection.find().toArray(function(err, accts) {
            if (err) return cb(err);
            cb(null, accts);
        });
    });
}
