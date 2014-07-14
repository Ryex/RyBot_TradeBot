var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;

var signals;
module.exports = signals = {};

signals.listSignals = function(query, cb) {
    gdb().collection("configs", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, configs) {
            if (err) return cb(err);
            cb(null, configs);
        });
    });
}

signals.Signal = function(sig_obj) {
    var self = this;
    
    if (typeof(sig_obj) != 'object') {
        throw new Error("Invalid type for `sig_obj`: expected `object`, got `" + typeof(sig_obj) + "`");
    }
    
    if (typeof(sig_obj.accountName) != 'string') {
        throw new Error("Invalid type for `sig_obj.accountName`: expected `string` got `" + typeof(sig_obj.accountName) + "`");
    }
    
    if (typeof(sig_obj.signalName) != 'string') {
        throw new Error("Invalid type for `sig_obj.signalName`: expected `string` got `" + typeof(sig_obj.signalName) + "`");
    }
    
    if (typeof(sig_obj.pairName) != 'string') {
        throw new Error("Invalid type for `sig_obj.pairName`: expected `string` got `" + typeof(sig_obj.pairName) + "`");
    }
    
    if (typeof(sig_obj.apiName) != 'string') {
        throw new Error("Invalid type for `sig_obj.apiName`: expected `string` got `" + typeof(sig_obj.apiName) + "`");
    }
    
    if (typeof(sig_obj.algorithm) != 'string') {
        throw new Error("Invalid type for `sig_obj.algorithm`: expected `string` got `" + typeof(sig_obj.algorithm) + "`");
    }
    
    if (typeof(sig_obj.actions) === 'undefined') {
        sig_obj.actions = [];
    }
    
    self.accountName = sig_obj.accountName;
    self.signalName = sig_obj.signalName;
    self.pairName = sig_obj.pairName;
    self.apiName = sig_obj.apiName;
    self.algorithm = sig_obj.algorithm;
    self.actions = sig_obj.actions;
    self._id = sig_obj._id || new DB.ObjectID();
    
    self.save = function(cb) {
        var sig_obj = {
            _id: self._id,
            accountName: self.accountName,
            signalName: self.signalName,
            pairName: self.pairName,
            apiName: self.apiName, 
            algorithm: self.algorithm, 
            actions: self.actions,
        }
        gdb().collection("signals", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, sig_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    }
}