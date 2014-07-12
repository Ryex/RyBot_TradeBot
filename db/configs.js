var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var cfg;
module.exports = cfg = {};

cfg.Config = function(cfg_obj) {
    var self = this;

    if (typeof(cfg_obj) != 'object') {
        throw new Error("Invalid type for `cfg`: expected `object`, got `" + typeof(cfg_obj) + "`");
    }

    self.botName = cfg_obj.botName || "";
    self.main = cfg_obj.main || false;

    self.save = function () {

    }

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