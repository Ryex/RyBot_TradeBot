/* ====================================
 * setup.js
 * - connects to teh database and sets up prerequasit
 * ====================================
 */



var async = require('async');
var VError = require('verror');
var Db = require('./db');
var db = Db.db;
var config = require('./config.js');

var template_config = {
    name: "",
    pairs: [],
    signals: {},
    pass: ""
};




function configure(cb) {
    db.collection("config", function(err, collection) {
        if (err) { 
            return cb(err);
        } else {
            collection.find().toArray(function(err, docs) {
                if (err) { 
                    return cb(err);
                } else {
                    if (docs.length < 1) {
                        global.SETUP = true;
                    } else {
                        global.CONFIG = docs[0];
                        global.SETUP = false;
                        console.log("[Setup] Setup not needed");
                    }
                    return cb(null);
                }
            });
        }
    });
}

function ensure_users(cb) {
    db.collection("users", function(err, collection) {
        if (err) { 
            return cb(err);
        } else {
            collection.find().toArray(function(err, users) {
                if (err) { 
                    return cb(err);
                } else {
                    if (users.length < 1 && !global.SETUP) {
                        global.SETUP = true;
                    }
                    return cb(null);
                }
            });
        }
    });
}


function pull_trade_configs(cb) {
    db.collection("trade_configs", function(err, collection) {
        if (err) { 
            return cb(err);
        } else {
            collection.find().toArray(function(err, docs) {
                for (var i = 0; i < docs.length; i++) {
                    global.CONFIGS.push(docs[i]);
                    
                }
                return cb(null, docs);
            });
        }
    });
}


function setup_pairs(pairs, callback) {
    // a list of tasks that might need to be compleated async to get teh server ready
    tasks = [];

    // Create capped collections with a maximum of 20000 documents for traid pairs we want to trak
    // and capped collections for 10 and 30 minuet charts
    for (var i = 0; i < pairs.length; i++) {
        var trades_name = "trades_" + pairs[i];
        var min10_name = "10minute_" + pairs[i];
        var min30_name = "30minute_" + pairs[i];


        

        //add to task q
        tasks.push(function(cb){Db.createCollection(trades_name, cb);});
        tasks.push(function(cb){Db.forceTTLindex(trades_name, cb);});
        tasks.push(function(cb){Db.createCollection(min10_name, cb);});
        tasks.push(function(cb){Db.forceTTLindex(min10_name, cb);});
        //tasks.push(forcep2(min10_name))
        tasks.push(function(cb){Db.createCollection(min30_name, cb);});
        tasks.push(function(cb){Db.forceTTLindex(min30_name, cb);});
        //tasks.push(forcep2(min30_name))



    }

    // run all our tasks async but in series
    async.series(tasks, function(err, results) {
        if (err) {
            return callback(err);
        }

        callback(null, results);
    });

}



function prepare(callback) {
    // Establish connection to db
    db.open(function(err, db) {
        if (err) {
            var err1 = new VError(err, "Failed to Connect to Database");
            return callback(err1);
        }

        

        var setup_db = function() {
            var tasks = [];

            tasks.push(Db.ensureLog);
            tasks.push(configure);
            tasks.push(ensure_users);
            tasks.push(pull_trade_configs);

            var pairs = [];

            for (var i = 0; i < global.CONFIGS.length; i++) {
                for (var j = 0; j < global.CONFIGS[i].pairs.length; j++) {
                    pairs.push(global.CONFIGS[i].pairs[j]);
                }
            }

            tasks.push(function(cb){
                setup_pairs(pairs, cb);
            });

            async.series(tasks, function(err, results) {
                if (err) {
                    return callback(err);
                }

                return callback(null, results);
            });   
        }

        if (config.dbUser !== "") {
            db.authenticate(config.dbUser, config.dbPass, {authdb: config.dbAuthName}, function(err, result) {
                if (err) {
                    var err1 = new VError(err, "Failed to Authenticate with Database");
                    return callback(err1);
                }
                if (!result) {
                    var err1 = new VError("Failed to Authenticate with Database");
                    return callback(err1);
                }
                setup_db()
            }); 
        } else {
            setup_db()
        }
        

        
    });

}



module.exports = {
    prepare: prepare,
    configure: configure,
    ensure_users: ensure_users
};