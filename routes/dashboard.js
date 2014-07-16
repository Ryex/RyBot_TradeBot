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
    res.render('dashboard', routes.genPageEnv(req, res));
};