var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var LocalAPIStrategy = require('passport-localapikey').Strategy;

var DB = require(global.appdir + '/db');
var gdb = DB.getDb;
var Users = DB.Users;
var config  = require(global.appdir + '/config.js');

var auth;
module.exports = auth = {};

auth.setupAuth = function() {
    
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
        
    passport.deserializeUser(function(id, done) {
        Users.findByID(id, function (err, user) {
            done(err, user);
        });
    });
    
    passport.use(new LocalStrategy(function(username, password, done) {
        // Find the user by username.  If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure and set a flash message.  Otherwise, return the
        // authenticated `user`.
        Users.findByUsername(username, function(err, user) {
            if (!user) return done(null, false, { message: 'Invalid Username/Password Pair'});
            
            user.testPassword(password, function(err, isMatch) {
                if (err) return done(err);
                
                if (isMatch) {
                    // this is a new login, lets reset their apikey
                    return user.setNewAPIKey(function(err, token) {
                        // save the new key
                        user.save(function(err, result){
                            done(null, user);
                        })
                    });   
                } else {
                    return done(null, false, { message: 'Invalid Username/Password Pair' }); 
                }
            });
        
        });
    }));
    
    passport.use(new LocalAPIStrategy(function(apikey, done) {
        Users.findByAPIKey(apikey, function(err, user) {
            if (err) return done(err); 
            if (!user) return done(null, false, { message: 'Unknown apikey : ' + apikey }); 
            return done(null, user);
        })
    }));

};