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
    

var DB;
module.exports = DB = {};

var config = require(global.appdir + '/config.js');

// create a db connection but do not open it yet, tell it to confirm write on the majority of all replicas
//var db = new Db(config.dbName, new Server(config.dbHost, config.dbPort, {auto_reconnect: true}, {}), {w: 1});
var mongoClient = new MongoClient(new Server(config.dbHost, config.dbPort, {auto_reconnect: true}, {}));
var db;

// open the database connection alternativly passing a dbname to overide the configuration
DB.open = function(cb, dbname) {
    mongoClient.open(function(err, mongoClient) {
        if (err) return cb(err);
        db = mongoClient.db(dbname || config.dbName);
        return cb(null, db);
    });
}

DB.getDb = function() {
    return db;
}

//close the database conncetion
DB.close = function() {
    mongoClient.close();
}

//force power of 2 allocation
DB.forcep2 = function(name, cb){
    db.command( {collMod: name, usePowerOf2Sizes : true }, function(err, result) {
        if (err) { 
            return cb(err);
        } else {
            return cb(null, result);
        }

    })
}   


// ensure that TTL indexes exist
DB.forceTTLindex = function(name, cb){
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

DB.createCollection = function(name, cb){
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


DB.Accounts = require("./accounts");
DB.Candles = require('./candles');
DB.Configs = require('./configs')
DB.Users = require('./users');
DB.Signals = require('./signals')

DB.ObjectID = ObjectID;
DB.Binary = Binary;
DB.GridStore = GridStore;
DB.Grid = Grid;
DB.Code = Code;
DB.BSON = BSON;


