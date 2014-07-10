var rek = require("rekuire");

var async = require('async');
var passport = require('passport');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js');
var setup = rek('setup.js');

module.exports = {
    user_settins: function(req, res){
    },

    bot_settings: function(req, res){

    },
    
    render: function(req, res){

    } 
  

}