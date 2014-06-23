
/**
 * Module dependencies.
 */


// get app envierment setup
var app_env = require('./env')

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
var routes = require(global.appdir + '/routes');

// get the function we need to set up
var setup = require(global.appdir + '/setup.js');

// load the configuration
var config  = require(global.appdir + '/config.js');


// set up the express server
var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// development only
if ('development' == app.get('env')) {
    app.use(morgan('dev'));
}

// we want cookies
app.use(cookieParser(config.cookieSecret));

// we want our cookies to store our session
app.use(expressSession({
    cookie: { maxAge: config.cookieMaxAge },
    secret: config.cookieSecret
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
    http.createServer(app).listen(config.serverPort, config.serverIp, function(){
        console.log('HTTP Express server listening on ' + config.serverIp + ":" + config.serverPort);
        var trader = require(global.appdir + '/trader.js');
        //trader.pairUpdaters['btc_usd'].start_updating()
    });
});

