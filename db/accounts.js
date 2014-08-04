var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var accounts;
module.exports = accounts = {};

accounts.Account = function(account_obj) {

    var self = this;

    if (typeof(account_obj) != 'object') {
        throw new Error("Invalid type for `account_obj`: expected `object`, got `" + typeof(account_obj) + "`");
    }
    
    if (typeof(account_obj.accountName) != 'string') {
        throw new Error("Invalid type for `account_obj.accountName`: expected `string`, got `" + typeof(account_obj.accountName) + "`");
    }

    if (typeof(account_obj.apiName) != 'string') {
        throw new Error("Invalid type for `account_obj.apiName`: expected `string`, got `" + typeof(account_obj.apiName) + "`");
    }

    if (typeof(account_obj.apiKey) != 'string') {
        throw new Error("Invalid type for `account_obj.name`: expected `string`, got `" + typeof(account_obj.apiKey) + "`");
    }
    
    if (typeof(account_obj.apiSecret) != 'string') {
        throw new Error("Invalid type for `account_obj.apiSecret`: expected `string`, got `" + typeof(account_obj.apiSecret) + "`");
    }

    self.apiName = account_obj.apiName;
    self.accountName = account_obj.accountName;
    self.apiKey = account_obj.apiKey;
    self.apiSecret = account_obj.apiSecret;
    self._id = account_obj._id || new DB.ObjectID();
    
    self.save = function(cb) {
        var acc_obj = {
            _id: self._id,
            apiName: self.apiName,
            accountName: self.accountName,
            apiKey: self.apiKey,
            apiSecret: self.apiSecret
        }
        gdb().collection("accounts", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, acc_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    }

}

accounts.listAccounts = function(query, cb) {
    gdb().collection("accounts", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, accts) {
            if (err) return cb(err);
            cb(null, accts);
        });
    });
}
