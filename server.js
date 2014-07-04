
/**
 * Module dependencies.
 */


// get app envierment setup
var app_env = require('./env')

// get nodejs included modules
var http = require('http');
var https = require('https');
var path = require('path');

// Logging
var scribe = require(global.appdir + '/scribe');


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
var routes = require(global.appdir + '/routes');

// get the function we need to set up
var setup = require(global.appdir + '/setup.js');

// load the configuration
var config  = require(global.appdir + '/config.js');

// configur logging

scribe.configure(function(){
    scribe.set('app', 'RyBot_Trader');                  // NOTE Best way learn about these settings is
    scribe.set('logPath', global.appdir + '/scribe');   // them out for yourself.
    scribe.set('defaultTag', 'DEFAULT_TAG');
    scribe.set('divider', ':::');
    scribe.set('identation', 5);                        // Identation before console messages

    scribe.set('maxTagLength', 30);                     // Any tags that have a length greather than
                                                        // 30 characters will be ignored

    scribe.set('mainUser', process.env.USER);           // Username of the account which is running
                                                        // the NodeJS server
});

scribe.addLogger("log", true , true, 'green');            // (name, save to file, print to console,
scribe.addLogger('realtime', true, true, 'underline');    // tag color)
scribe.addLogger('high', true, true, 'magenta');
scribe.addLogger('normal', true, true, 'white');
scribe.addLogger('low', true, true, 'grey');


// set up the express server
var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// development only
if ('development' == app.get('env')) {
    app.use(scribe.express.logger(function(req, res){         // Express.js access log
        return true;                                          // Filter out any Express messages
    }));
}

// we want cookies
app.use(cookieParser(config.cookieSecret));

// we want our cookies to store our session
app.use(expressSession({
    cookie: { maxAge: config.cookieMaxAge },
    secret: config.cookieSecret,
    resave: true,
    saveUninitialized: true
}));

// we want to be able to use flash messages
app.use(flash());

// set up authentication middleware
app.use(passport.initialize());
app.use(passport.session());

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
routes.add_routes(app);


setup.prepare( function(err, results){
    if (err) { global.BAD_ERROR = err; }
    var auth = require(global.appdir + '/auth.js');
    if (config.runHTTPS) {
        http.createServer(app).listen(config.serverHTTPSPort, config.serverIp, function(){
            console.log('[Server] HTTPS Express server listening on ' + config.serverHTTPSIp + ":" + config.serverPort);
        });
    }
    if (!config.HTTPSOnly || !config.runHTTPS) {
        http.createServer(app).listen(config.serverPort, config.serverIp, function(){
            console.log('[Server] HTTP Express server listening on ' + config.serverIp + ":" + config.serverPort);
        });
    }

});

