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



// create a db connection but do not open it yes, tell it to confirm write on teh majority of all replicas
exports.db = new Db(config.dbName, new Server(config.dbHost, config.dbPort, {auto_reconnect: true}, {}), {w: 1});

exports.candle = require('./candle.js');