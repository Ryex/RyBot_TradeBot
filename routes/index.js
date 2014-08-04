
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

routes.badGlobalError = function(req, res, next) {
    if (!global.BAD_ERROR) { return next();}
    var env = routes.genPageEnv(req, res)
    env.error = global.BAD_ERROR;
    res.render('error', env);
}

routes.ensureSetup = function(req, res, next) {
    if (!global.SETUP) { return next(); }
    res.redirect('/setup')
}

routes.webAuthenticate = passport.authenticate('local', { failureRedirect: '/login', failureFlash: true });
routes.apiAuthenticate = passport.authenticate('localapikey', { session: false, failureRedirect: '/api/unauthorized', failureFlash: true });

routes.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

routes.ensureAdmin = function(req, res, next) {
    if (req.user.admin) {return next(); }
    res.flash("error", "Not an Admin");
    res.redirect('/')
}

routes.addRoutes = function(app) {
    
    routes.buildRoutes();
    
    app.use(routes.badGlobalError);

    app.get('/', routes.ensureSetup, routes.ensureAuthenticated, routes.dashboard);
    
    app.get('/log', routes.ensureSetup, routes.ensureAuthenticated, routes.ensureAdmin, scribe.express.controlPanel()); 

    app.get('/setup', routes.setup);
    app.post('/setup', routes.setup);

    app.get('/login', routes.ensureSetup, routes.login);
    app.post('/login', routes.ensureSetup, routes.webAuthenticate, function(req, res) {
            res.redirect('/');
    });

    app.get('/logout', routes.ensureSetup, function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/settings', routes.ensureSetup, routes.ensureAuthenticated, routes.ensureAdmin, routes.settings);
    app.post('/settings', routes.ensureSetup, routes.ensureAuthenticated, routes.ensureAdmin, routes.settings);
    
    app.get('/api/bad', routes.ensureSetup, function(req, res) {
        res.json({error : "Not Authenticated", message: req.flash('error')})
    });
    
    app.all('/api/accounts/list', routes.ensureSetup, routes.apiAuthenticate, routes.accounts.list);
    
    app.get('/api/candle/:name/:mins/:pair/:date_start/:date_end', routes.ensureSetup, routes.ensureAuthenticated,  routes.candles);
    
};

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

};

routes.buildRoutes = function () {

    routes.login = function(req, res){
        if (req.user) {return res.redirect('/');}
        res.render('login', routes.genPageEnv(req, res));
    };
    
    routes.setup = require('./setup');
    routes.settings = require('./settings');
    routes.accounts = require('./accounts');
    routes.dashboard = require('./dashboard');
    routes.candles = require('./candles.js');
};