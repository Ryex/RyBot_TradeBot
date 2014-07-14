/* ====================================
 * setup.js
 * - connects to teh database and sets up prerequasit
 * ====================================
 */

var rek = require('rekuire');

var async = require('async');
var VError = require('verror');
var DB = rek('db');
var Users = DB.Users;
var Configs = DB.Configs
var gdb = DB.getDb;
var config = rek('config.js');

var template_config = {
    name: "",
    pairs: [],
    signals: {},
    pass: ""
};




function configure(cb) {
    Configs.listConfigs({main: true}, function(err, configs) {
        if (err) return cb(err);
        if (configs.length < 1) {
            global.SETUP = true;
            console.warn("[Startup] Setup needed");
        } else {
            global.CONFIG = configs[0];
            global.SETUP = false;
            console.log("[Startup] Setup not needed");
        }
        return cb(null, global.SETUP);
    })
}

function ensure_users(cb) {
    Users.listUsers({}, function(err, users) {
        if (err) return cb(err);
        
        if (users.length < 1 && !global.SETUP) {
            global.SETUP = true;
        }
        return cb(null,  global.SETUP);
    })
}

/*
function setup_pairs(pairs, callback) {
    // a list of tasks that might need to be compleated async to get teh server ready
    var tasks = [];

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

}*/



function prepare(callback) {
    // Establish connection to db
    DB.open(function(err, db) {
        if (err) {
            var err1 = new VError(err, "Failed to Connect to Database");
            return callback(err1);
        }

        var setup_db = function() {
            var tasks = [];

            tasks.push(configure);
            tasks.push(ensure_users);


            async.series(tasks, function(err, results) {
                if (err) return callback(err);
                return callback(null, results);
            });
        }

        if (config.dbUser !== "") {
            db.authenticate(config.dbUser, config.dbPass, {authdb: config.dbAuthName}, function(err, result) {
                var new_err;
                if (err) {
                    new_err= new VError(err, "Failed to Authenticate with Database");
                    console.error(new_err);
                    return callback(new_err);
                }
                if (!result) {
                    new_err = new VError("Failed to Authenticate with Database");
                    console.error(new_err);
                    return callback(new_err);
                }
                setup_db();
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