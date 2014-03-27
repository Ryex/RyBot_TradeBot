
/**
 * Module dependencies.
 */

global.appdir = __dirname;

global.SETUP = false;
global.CONFIG = {
    name: "",
    key: "",
    secret: "",
    pairs: []
};


global.CONFIGS = [];
global.SELECTED_CONFIG = -1;
global.TRADERS = [];

var express = require('express');
var routes = require(global.appdir + '/routes');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var passport = require('passport');

var setup = require(global.appdir + '/setup.js');

var config  = require(global.appdir + '/config.js');

var app = express();


// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// development only
if ('development' == app.get('env')) {
    app.use(express.logger('dev'));
}

app.use(express.cookieParser(config.cookieSecret));
app.use(express.session({ cookie: { maxAge: config.cookieMaxAge }}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


routes.add_routes(app);

setup.prepare( function(){
    var auth = require(global.appdir + '/auth.js');
    http.createServer(app).listen(config.serverPort, config.serverIp, function(){
        console.log('Express server listening on ' + config.serverIp + ":" + config.serverPort);
        var trader = require(global.appdir + '/trader.js');
        //trader.pairUpdaters['btc_usd'].start_updating()
    });
});

