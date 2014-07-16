/* ====================================
 * setup.js
 * - connects to teh database and sets up prerequasit
 * ====================================
 */

var rek = require('rekuire');


// get nodejs included modules
var http = require('http');
var https = require('https');
var path = require('path');

// get express and it's official middleware
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');

// 3ed party middleware
var flash = require('connect-flash');
var passport = require('passport');

// get our routes
var routes = rek('routes');
var auth = rek('auth.js');

// load the configuration
var Config  = rek('config.js');

var async = require('async');
var VError = require('verror');
var DB = rek('db');
var Users = DB.Users;
var Configs = DB.Configs
var gdb = DB.getDb;


var scribe = rek('scribe');

var startup;
module.exports = startup = {};

var template_config = {
    name: "",
    pairs: [],
    signals: {},
    pass: ""
};

startup.setupScribe = function() {
    // configure logging
    scribe.configure(function(){
        scribe.set('app', 'RyBot_Trader');                  // NOTE Best way learn about these settings is
        scribe.set('logPath', global.appdir + '/scribe');     // them out for yourself.
        scribe.set('defaultTag', 'DEFAULT_TAG');
        scribe.set('divider', ':::');
        scribe.set('identation', 5);                        // Identation before console messages

        scribe.set('maxTagLength', 30);                     // Any tags that have a length greather than
                                                            // 30 characters will be ignored

        scribe.set('mainUser', process.env.USER);           // Username of the account which is running
                                                            // the NodeJS server
    });

    scribe.addLogger("log", true , true, 'green');            // (name, save to file, print to console, tag color
    scribe.addLogger("warn", true , true, 'yellow');
    scribe.addLogger("error", true , true, 'red');
    scribe.addLogger('realtime', true, true, 'underline');
    scribe.addLogger('high', true, true, 'magenta');
    scribe.addLogger('normal', true, true, 'white');
    scribe.addLogger('low', true, true, 'grey');
}


startup.buildApp = function () {

    // set up the express server
    var app = express();

    // all environments
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // development only
    if ('development' == app.get('env') && !global.TESTING) {
        app.use(scribe.express.logger(function(req, res){         // Express.js access log
            return true;                                          // Filter out any Express messages
        }));
    }

    // we want cookies
    app.use(cookieParser(Config.cookieSecret));

    // we want our cookies to store our session
    app.use(expressSession({
        cookie: { maxAge: Config.cookieMaxAge },
        secret: Config.cookieSecret,
        resave: true,
        saveUninitialized: true
    }));

    // we want to be able to use flash messages
    app.use(flash());

    // set up authentication middleware
    app.use(passport.initialize());
    app.use(passport.session());

    auth.setupAuth();

    // parse request bodies
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    // let us overide HTTP verbs
    app.use(methodOverride());



    // development only
    if ('development' == app.get('env')) {
        app.use(errorhandler());
    }

    // respond to static paths
    app.use(express.static(path.join(__dirname, 'public')));

    //add routes
    routes.addRoutes(app);
    
    routes.addErrorRoutes(app)

    return app;
};

var serverHTTP, serverHTTPS;

startup.run = function(app, callback, dbname) {
    startup.prepare( function(err, results){
        if (err) {
            global.BAD_ERROR = err;
            console.error("[Startup]", err.stack);
        }
        var tasks = [];
        if (Config.runHTTPS) {
            tasks.push(function(cb){
                serverHTTPS = https.createServer(app).listen(Config.serverHTTPSPort, Config.serverIp, function(){
                    console.log('[Server] HTTPS Express server listening on ' + Config.serverHTTPSIp + ":" + Config.serverPort);
                    cb(null, true);
                });
            });

        }
        if (!Config.HTTPSOnly || !Config.runHTTPS) {
            tasks.push(function(cb){
                serverHTTP = http.createServer(app).listen(Config.serverPort, Config.serverIp, function(){
                    console.log('[Server] HTTP Express server listening on ' + Config.serverIp + ":" + Config.serverPort);
                    cb(null, true);
                });
            });
        }

        async.parallel(tasks, function(err, results) {
            // all servers running
            callback(null, true);
        });
    }, dbname);
};

startup.stop = function(callback) {
    var tasks = [];
    if (serverHTTP) {
        tasks.push(function(cb){
            serverHTTP.close(function () {
                console.log("[Server] HTTP Closed out remaining connections.");
                cb(null, true);
            });
        });
    }

    if (serverHTTPS) {
        tasks.push(function(cb){
            serverHTTPS.close(function () {
                console.log("[Server] HTTPS Closed out remaining connections.");
                cb(null, true);
            });
        });
    }

    if (tasks.length > 0) {
        async.parallel(tasks, function(err, results) {
            // Close db connections, etc.
            DB.close();
            callback(null, true);
        });
    }
};

startup.configure = function(cb) {
    
    Configs.listConfigs({main: true}, function(err, configs) {
        if (err) return cb(err);
        if (configs.length < 1) {
            global.SETUP = true;
            console.warn("[Startup] Setup needed");
        } else {
            global.CONFIG = configs[0];
            global.SETUP = false;
        }
        return cb(null, global.SETUP);
    });
};

startup.ensure_users = function(cb) {
    Users.listUsers({}, function(err, users) {
        if (err) return cb(err);

        if (users.length < 1 && !global.SETUP) {
            global.SETUP = true;
        }
        return cb(null,  global.SETUP);
    });
};

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



startup.prepare = function(callback, dbname) {
    // Establish connection to db
    DB.open(function(err, db) {
        if (err) {
            var err1 = new VError(err, "Failed to Connect to Database");
            return callback(err1);
        }
        
        
        
        var setup_db = function() {
            var tasks = [];
            tasks.push(startup.configure);
            tasks.push(startup.ensure_users);


            async.series(tasks, function(err, results) {
                if (err) return callback(err);
                return callback(null, results);
            });
        };

        if (Config.dbUser !== "") {
            db.authenticate(Config.dbUser, Config.dbPass, {authdb: Config.dbAuthName}, function(err, result) {
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
            setup_db();
        }

    }, dbname);

};
