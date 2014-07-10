var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var cfg;
module.exports = cfg = {};

cfg.Config = function() {

}

cfg.listConfigs = function(cb) {
    gdb().collection("configs", function(err, collection) {
        if (err) return cb(err);
        collection.find().toArray(function(err, configs) {
            if (err) return cb(err);
            cb(null, configs);
        });
    });
}