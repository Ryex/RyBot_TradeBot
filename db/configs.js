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
    
    if (typeof(cfg_obj.themeName) != 'undefined' && typeof(cfg_obj.themeName) != 'string') {
        throw new Error("Invalid type for `cgf_obj.themeName`: expected `string`, got `" + typeof(cfg_obj.themeName) + "`");
    }
    
    if (typeof(cfg_obj.autostartAgg) != 'undefined' && typeof(cfg_obj.autostartAgg) != 'boolean') {
        throw new Error("Invalid type for `cgf_obj.autostartAgg`: expected `boolean`, got `" + typeof(cfg_obj.autostartAgg) + "`");
    }

    self.botName = cfg_obj.botName;
    self.main = cfg_obj.main;
    self.themeName = cfg_obj.themeName || 'default';
    self.autostartAgg = cfg_obj.autostartAgg || false;
    self._id = cfg_obj._id || new DB.ObjectID();

    self.save = function (cb) {
        var cfg_obj = {
            _id: self._id,
            botName: self.botName,
            themeName: self.themeName,
            autostartAgg: self.autostartAgg,
            main: self.main
        }
        gdb().collection("configs", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, cfg_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    }

}

cfg.listConfigs = function(query, cb) {
    gdb().collection("configs", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, configs) {
            if (err) return cb(err);
            cb(null, configs);
        });
    });
}