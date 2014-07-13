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

    if (typeof(account_obj.apiName) != 'string') {
        throw new Error("Invalid type for `apiName`: expected `string`, got `" + typeof(account_obj.apiName) + "`");
    }

    if (typeof(account_obj.apiKey) != 'string') {
        throw new Error("Invalid type for `name`: expected `string`, got `" + typeof(account_obj.apiKey) + "`");
    }
    
    if (typeof(account_obj.apiSecret) != 'string') {
        throw new Error("Invalid type for `apiSecret`: expected `string`, got `" + typeof(account_obj.apiSecret) + "`");
    }
    
    if (typeof(account_obj.assets) === 'undefined') account_obj.main = {};

    self.apiName = account_obj.apiName;
    self.apiKey = account_obj.apiKey;
    self.apiSecret = account_obj.apiSecret;
    self.assets = account_obj.assets;

}

accounts.listAccounts = function(cb) {
    gdb().collection("accounts", function(err, collection) {
        if (err) return cb(err);
        collection.find().toArray(function(err, accts) {
            if (err) return cb(err);
            cb(null, accts);
        });
    });
}
