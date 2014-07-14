var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var cfg;
module.exports = cfg = {};

cfg.Config = function(cfg_obj) {
    var self = this;

    if (typeof(cfg_obj) != 'object') {
        throw new Error("Invalid type for `cfg_obj`: expected `object`, got `" + typeof(cfg_obj) + "`");
    }
    
    if (typeof(cfg_obj.main) === 'undefined') cfg_obj.main = true;
    
    if (typeof(cfg_obj.botName) != 'string') {
        throw new Error("Invalid type for `cgf_obj.botName`: expected `string`, got `" + typeof(cfg_obj.botName) + "`");
    }

    self.botName = cfg_obj.botName;
    self.main = cfg_obj.main;

    self.save = function (cb) {
        var cfg_obj = {
            botName: self.botName,
            main: self.main
        }
        gdb().collection("configs", function(err, collection) {
            if (err) return cb(err);
            collection.update({main: self.main}, cfg_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
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