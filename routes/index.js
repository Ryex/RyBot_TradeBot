
/*
 * GET home page.
 */
var async = require('async');
var passport = require('passport');

var Db = require(global.appdir + '/db');
var db = Db.db;
var config  = require(global.appdir + '/config.js');
var setup = require(global.appdir + '/setup.js');

var scribe = require(global.appdir + '/scribe');

var routes;
module.exports = exports = routes = {};


function genPageEnv(req, res) {
    var title = global.CONFIG.name || "Rybot Trade Bot";
    return {
        title: title,
        config: global.CONFIG,
        name: title,
        error_message: req.flash('error'),
        info_message: req.flash('info'),
        success_message: req.flash('success'),
        warning_message: req.flash('warning'),
        error: global.BAD_ERROR,
        user: req.user
    }
}

function badGlobalError(req, res, next) {
    if (!global.BAD_ERROR) { return next();}
    var params = genPageEnv(req, res);
    res.render('error', params);
}

function ensureSetup(req, res, next) {
    if (!global.SETUP) { return next(); }
    res.redirect('/setup')
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

function ensureAdmin(req, res, next) {
    if (req.user.admin) {return next(); }
    res.flash("error", "Not an Admin");
    res.redirect('/')
}

exports.add_routes = function(app) {
    app.use(badGlobalError);

    app.get('/', ensureSetup, ensureAuthenticated, routes.index);
    
    app.get('/log', ensureSetup, ensureAuthenticated, ensureAdmin, scribe.express.controlPanel()); 

    app.get('/setup', routes.setup);
    app.post('/setup', routes.setup);

    app.get('/login', ensureSetup, routes.login);
    app.post('/login', ensureSetup, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        function(req, res) {
            res.redirect('/');
        }
    )

    app.get('/logout', ensureSetup, function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/candle/:name/:mins/:pair/:date_start/:date_end', ensureSetup, ensureAuthenticated,  routes.candles);

    app.get ('/settings', ensureSetup, ensureAuthenticated, routes.settings.render)
}

routes.login = function(req, res){
    var params = genPageEnv(req, res);
    res.render('login', params)
}

routes.setup = require('./setup.js');
routes.settings = require('./settings.js');

routes.index = function(req, res){
    var params = genPageEnv(req, res);
    res.render('index', params)
};

routes.candles = require('./candles.js')