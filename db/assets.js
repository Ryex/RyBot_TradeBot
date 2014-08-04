var rek = require('rekuire');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');


var assets;
module.exports = assets = {};

assets.Funds = function(funds_obj) {

    var self = this;

    if (typeof(funds_obj) != 'object') {
        throw new Error("Invalid type for `funds_obj`: expected `object`, got `" + typeof(funds_obj) + "`");
    }
    
    if (typeof(funds_obj.accountID) != 'string') {
        throw new Error("Invalid type for `funds_obj.accountName`: expected `string`, got `" + typeof(funds_obj.accountName) + "`");
    }

    
    if (typeof(funds_obj.assets) === 'undefined') funds_obj.main = {};


    self.accountID = funds_obj.accountID;
    self.assets = funds_obj.assets;
    self._id = funds_obj._id || new DB.ObjectID();
    
    self.save = function(cb) {
        var acc_obj = {
            _id: self._id,
            accountID: self.accountID,
            assets: self.assets

        }
        gdb().collection("assets", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, acc_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    }

}

assets.fetchFunds = function(query, cb) {
    gdb().collection("assets", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, accts) {
            if (err) return cb(err);
            cb(null, accts);
        });
    });
}