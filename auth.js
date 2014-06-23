var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Db = require(global.appdir + '/db');
var db = Db.db;
var User = Db.User;
var config  = require(global.appdir + '/config.js');



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Find the user by username.  If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message.  Otherwise, return the
    // authenticated `user`.
    User.findByUsername(username, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Unknown user ' + username });

      User.comparePassword(candidatePassword, user, function(err, isMatch) {
        if (err) return done(err);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        } else {
          return done(null, user);
        }
      })
      
    })
  }
));