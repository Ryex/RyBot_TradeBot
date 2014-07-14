var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;

var pairs;
module.exports = pairs = {};

pairs.listPairs = function(query, cb) {
    gdb().collection("pairs", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, configs) {
            if (err) return cb(err);
            cb(null, configs);
        });
    });
}

pairs.Pair = function(pair_obj) {
    var self = this;
    
    if (typeof(pair_obj) != 'object') {
        throw new Error("Invalid type for `pair_obj`: expected `object`, got `" + typeof(pair_obj) + "`");
    }
    
    if (typeof(pair_obj.pairName) != 'string') {
        throw new Error("Invalid type for `pair_obj.pairName`: expected `string`, got `" + typeof(pair_obj.pairName) + "`");
    }
    
    if (typeof(pair_obj.apiName) != 'string') {
        throw new Error("Invalid type for `pair_obj.apiName`: expected `string`, got `" + typeof(pair_obj.apiName) + "`");
    }
    
    if (typeof(pair_obj.active) != 'undefined' && typeof(pair_obj.active) != 'boolean' ) {
        throw new Error("Invalid type for `pair_obj.active`: expected `string`, got `" + typeof(pair_obj.active) + "`");
    }
    
    self.apiName = pair_obj.apiName;
    self.pairName = pair_obj.pairName;
    self.active = pair_obj.active || false;
    self._id = pair_obj._id || new DB.ObjectID();
    
    
    self.save = function(cb) {
        var pair_obj = {
            _id: self._id,
            pairName: self.pairName,
            apiName: self.apiName,
            active: self.active
        }
        gdb().collection("pairs", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, pair_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    }
    
}