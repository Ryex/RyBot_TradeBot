var rek = require("rekuire");
var VError = require('verror');

var async = require('async');
var passport = require('passport');

var DB = rek('db');
var gdb = DB.getDb;
var Users = DB.Users;
var Configs = DB.Configs;

var config  = rek('config.js');
var startup = rek('startup.js');

var routes = rek('routes');

module.exports = function(req, res){
    if (req.method === 'POST') {

        var config = new Configs.Config(global.CONFIG);
        config.botName = req.body.app.botName;
        config.themeName = req.body.app.themeName;
        config.autostartAgg = req.body.app.autostartAgg ? true : false;
        config.save(function(err, result) {
            if (err) throw err;
            if (!result) throw Error("ERROR: Config failed to save");
            startup.configure(function(err, result) {
                return res.redirect('/settings');
            })
        });
    } else  if (req.method === 'GET'){
        res.render('settings', routes.genPageEnv(req, res));
    }
}