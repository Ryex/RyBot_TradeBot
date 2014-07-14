var rek = require('rekuire');
var VError = require('verror');

var async = require('async');
var passport = require('passport');

var DB = rek('db');
var gdb = DB.getDb;
var Users = DB.Users;
var Configs = DB.Configs;
var CFG  = rek('config.js');
var startup = rek('startup.js');

var routes = rek('routes');

module.exports = function(req, res){
    if (global.SETUP) {
        if (req.method === 'POST') {
            var user = new Users.User({
                name: req.body.user.name,
                password: req.body.user.pass,
                admin: true
            });

            var config = new Configs.Config({
                main: true,
                botName: req.body.app.name
            });

            var check_user = function() {
                if (req.body.user.name && req.body.user.pass) return true;
                return false;
            };
            
            var check_pass = function() {
                if (req.body.user.pass === req.body.user.pass_confirm) return true;
                return false;
            };

            var check_config =function(config) {
                if (req.body.app.name) return true;
                return false;
            };

            if (check_user() && check_config()) {
                
                if (check_pass(user)) {
                    
                    var tasks = [];

                    tasks.push(function(cb){
                        // update the config
                        config.save(function(err, result) {
                            console.log("entering  save after", err, result)
                            if (err) return cb(new VError(err, "Config failed to save"));
                            if (!result) return cb(new Error("ERROR: Config failed to save"));
                            return cb(null, result);
                        });
                    });
    
                    tasks.push(function(cb){
                        // add the admin user
                        user.prepare(function(err, result) {
                            if (err) return cb(new VError(err, "User preperation failed"));
                            if (!result) return cb(new Error("ERROR: User preperation failed"));
                            console.log("user prepare", user)
                            user.save(function(err, result) {
                                console.log("entering user save after", err, result)
                                if (err) return cb(new  VError(err, "User failed to save"));
                                if (!result) return cb(new Error("ERROR: User failed to save"));
                                return cb(null, result);
                            });
                        });
                    });
    
                    tasks.push(startup.configure);
                    tasks.push(startup.ensure_users);
    
                    async.series(tasks, function(err, results) {
                        console.log("entering async after", err, results)
                        if (err) throw new VError(err, "Could not save first time configuration");
                        console.log("redirecting")
                        res.redirect('/');
                    });
                    
                } else {
                    req.flash('error', 'Passwords do not match');
                    res.redirect('/');
                }
                
            } else {
                req.flash('error', 'Please fill in all fields');
                res.redirect('/');
            }



        } else  if (req.method === 'GET'){
            res.render('setup', routes.genPageEnv(req, res));
        }
    } else {
        res.redirect('/');
    }
};