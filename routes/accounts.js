var rek = require("rekuire");
var VError = require('verror');

var async = require('async');
var passport = require('passport');

var DB = rek('db');
var gdb = DB.getDb;
var Users = DB.Users;
var Accounts = DB.Accounts;
var Configs = DB.Configs;

var config  = rek('config.js');
var startup = rek('startup.js');

var routes = rek('routes');

var accounts
module.exports = accounts = {};

accounts.list = function(req, res){
    Accounts.listAccounts({}, function(err, data) {
        if (err) return res.json({error: err.message});
        return res.json(data);
    })
};