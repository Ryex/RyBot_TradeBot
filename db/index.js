var mongo = require('mongodb');
var Db = mongo.Db,
    MongoClient = mongo.MongoClient,
    Server = mongo.Server,
    ReplSetServers = mongo.ReplSetServers,
    ObjectID = mongo.ObjectID,
    Binary = mongo.Binary,
    GridStore = mongo.GridStore,
    Grid = mongo.Grid,
    Code = mongo.Code,
    BSON = mongo.pure().BSON,
    assert = require('assert');

var config = require(global.appdir + '/config.js');

// create a db connection but do not open it yet, tell it to confirm write on the majority of all replicas
var db = new Db(config.dbName, new Server(config.dbHost, config.dbPort, {auto_reconnect: true}, {}), {w: 1});

//force power of 2 allocation
var forcep2 = function(name, cb){
    db.command( {collMod: name, usePowerOf2Sizes : true }, function(err, result) {
        if (err) { 
            return cb(err);
        } else {
            return cb(null, result);
        }

    })
}   


// ensure that TTL indexes exist
var forceTTLindex = function(name, cb){
    db.collection(name, function(err, collection) {
        if (err) {
            return cb(err);
        }
        //expire after 30 days
        collection.ensureIndex({ "createdAt": 1 }, { expireAfterSeconds: 1000*60*60*24*config.dataDays}, function(err, indexName){
            if (err) { 
                return cb(err);
            } else {
                return cb(null, indexName);
            }
        })
    })
}



var createCollection = function(name, cb){
    //{capped: true, size: 102400, max: 1000},
    db.createCollection(name,  function(err, collection) {
        if (err) { 
            return cb(err);
        } else {
            //capped 
            return cb(null, collection);
        }
    })
}

var ensureLog = function(cb) {
    db.createCollection("logs",  function(err, collection) {
        if (err) { 
            return cb(err);
        } else {
            collection.ensureIndex({ "createdAt": 1 }, { expireAfterSeconds: 1000*60*60*24*config.logDays}, function(err, indexName){
                if (err) { 
                    return cb(err);
                } else {
                    return cb(null, indexName);
                }
            })
        }
    })
}
          
var log = function(type, message) {
    db.collection(name, function(err, collection) {
        if (err) { 
            console.log(err);
        } else {
            collection.insert({type: type, message: message, createdAt: new Date()}, function(err, result){
                if (err) { 
                    console.log(err);
                } 
            })
        }
    })
}
 

exports.ensureLog = ensureLog;
exports.log = log;

exports.createCollection = createCollection;
exports.forceTTLindex = forceTTLindex;
exports.forcep2 = forcep2;


exports.db = db;

exports.candle = require('./candle.js');
exports.User = require('./user.js');

exports.ObjectID = ObjectID;
exports.Binary = Binary;
exports.GridStore = GridStore;
exports.Grid = Grid;
exports.Code = Code;
exports.BSON = BSON;


