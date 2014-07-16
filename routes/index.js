
/*
 * GET home page.
 */
var rek = require("rekuire");
 
var async = require('async');
var passport = require('passport');

var DB = rek('db');
var gdb = DB.getDb;
var Config  = rek('config.js');

var scribe = rek('scribe');

var routes;
module.exports = exports = routes = {};


routes.genPageEnv = function(req, res) {
    var title = global.CONFIG.botName || "Rybot Trade Bot";
    return {
        title: title,
        config: global.CONFIG,
        Config: Config,
        name: title,
        error_message: req.flash('error'),
        info_message: req.flash('info'),
        success_message: req.flash('success'),
        warning_message: req.flash('warning'),
        user: req.user
    }
}

function badGlobalError(req, res, next) {
    if (!global.BAD_ERROR) { return next();}
    var env = routes.genPageEnv(req, res)
    env.error = global.BAD_ERROR;
    res.render('error', env);
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

exports.addRoutes = function(app) {
    
    routes.buildRoutes();
    
    app.use(badGlobalError);

    app.get('/', ensureSetup, ensureAuthenticated, routes.dashboard);
    
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

    app.get('/settings', ensureSetup, ensureAuthenticated, ensureAdmin, routes.settings)
    app.post('/settings', ensureSetup, ensureAuthenticated, ensureAdmin, routes.settings)
}

routes.addErrorRoutes = function (app) {
    
    
    app.use(function(req, res, next){
        var env = routes.genPageEnv(req, res);
        env.url = req.url;
        res.status(404);
        
        // respond with html page
        if (req.accepts('html')) {
        res.render('404', env);
        return;
        }
        
        // respond with json
        if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
        }
        
        // default to plain-text. send()
        res.type('txt').send('Not found');
    });
    
    app.use(function(err, req, res, next){
      // we may use properties of the error object
      // here and next(err) appropriately, or if
      // we possibly recovered from the error, simply next().
      var env = routes.genPageEnv(req, res);
      env.error = err;
      res.status(err.status || 500);
      res.render('500', env);
    });

}

routes.buildRoutes = function () {

    routes.login = function(req, res){
        if (req.user) {return res.redirect('/');}
        res.render('login', routes.genPageEnv(req, res))
    }
    
    routes.setup = require('./setup');
    routes.settings = require('./settings');
    routes.dashboard = require('./dashboard')
    
    routes.index = function(req, res){
        res.render('index', routes.genPageEnv(req, res))
    };
    
    routes.candles = require('./candles.js')
}