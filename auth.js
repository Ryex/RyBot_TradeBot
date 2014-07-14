var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var DB = require(global.appdir + '/db');
var gdb = DB.getDb;
var Users = DB.Users;
var config  = require(global.appdir + '/config.js');



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Users.findByID(id, function (err, user) {
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
    Users.findByUsername(username, function(err, user) {
      if (!user) return done(null, false, { message: 'Invalid Username/Password Pair'});

      user.testPassword(password, function(err, isMatch) {
        if (err) return done(err);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid Username/Password Pair' });
        } else {
          return done(null, user);
        }
      })

    })
  }
));