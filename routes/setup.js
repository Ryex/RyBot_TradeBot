var async = require('async');
var passport = require('passport');

var Db = require(global.appdir + '/db');
var db = Db.db;
var config  = require(global.appdir + '/config.js');
var setup = require(global.appdir + '/setup.js')

module.exports = function(req, res){
    if (global.SETUP) {
        if (req.method === 'POST') {
            var user = {}
            user.username = req.body.user.name
            user.password = req.body.user.pass
            user.admin = true

            var config = {}
            config.main = true
            config.name = req.body.app.name
            config.key = req.body.app.key
            config.secret = req.body.app.secret

            console.log(user, config)

            function check_user(user) {
                if (user.username && user.password) return true;
                return false;
            }

            function check_config(config) {
                if (config.name && config.key && config.secret) return true;
                return false;
            }

            if (check_user(user) && check_config(config)) {
               var tasks = [];

                tasks.push(function(cb){
                    // update the config
                    db.collection("config", function(err, collection) {
                        if (err) { 
                            return cb(err);
                        } else {
                            collection.update({main: true}, config, {upsert:true}, function(err, result) {
                                if (err) { 
                                    return cb(err);
                                } else {
                                    return cb(null, result);
                                }
                            })
                        }
                    });
                })

                tasks.push(function(cb){
                    // add the admin user
                    db.collection("users", function(err, collection) {
                        if (err) { 
                            return cb(err);
                        } else {
                            collection.update({username: user.username}, user, {upsert:true}, function(err, result) {
                                if (err) { 
                                    return cb(err);
                                } else {
                                    return cb(null, result);
                                }
                            })
                        }
                    });
                })

                tasks.push(setup.configure);
                tasks.push(setup.ensure_users);

                async.series(tasks, function(err, results) {
                    if (err) {
                        req.flash('error', err)
                    }

                    res.redirect('/')
                }) 
            } else {
                req.flash('error', 'Please fill in all fields')
                res.redirect('/');
            }
            

            
        } else  if (req.method === 'GET'){
            var title = global.CONFIG.name ? global.CONFIG.name : "Rybot Trade Bot"
            res.render('setup', {title: title, name:  title, config: global.CONFIG, error_message: req.flash('error') })
        }
    } else {
        res.redirect('/');
    }  
}