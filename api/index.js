module.exports = exports = {};



var sync = require("./sync");
exports.sync = sync;

var apis;
exports.apis = apis = {};

apis.btce = require("./btce");

var singeltonAPISyncs = {};


exports.fetchSyncApi = function(name, apiName, private, args) {
    if (singeltonAPISyncs[name]) return singeltonAPISyncs[name];
    
    // obtain the proper constructor
    var api = private ? apis[apiName].private : apis[apiName].public;
    
    // I know it looks weird but this works as intended
    // it dynamicly passes the arguments passed in the args array to the constructor obtained above
    // then wraps it with the sync queue
    return new sync(new (Function.prototype.bind.apply(api, [null].concat(args))));
    
};