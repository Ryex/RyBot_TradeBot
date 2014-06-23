var Db = require(global.appdir + '/db');
var db = Db.db;
var config  = require(global.appdir + '/config.js')

var bcrypt = require('bcrypt'), 
    SALT_WORK_FACTOR = 10;

module.exports = user = {};

user.findByID = function(id, cb) {
  db.collection("users", function(err, collection){
    collection.findOne({_id: Db.ObjectID(id)}, function(err, user) {
      if (err) {
        return cb(err);
      } else {
        if (user) {
          return cb(null, user);
        } else {
          return cb(new Error('User ' + id + ' does not exist'));
        }
      }
    });
  });
}

user.findByUsername = function(username, cb) {
  db.collection("users", function(err, collection){
    collection.findOne({username: username}, function(err, user) {
      if (err) {
        return cb(err);
      } else {
        if (user) {
          return cb(null, user);
        } else {
          return cb(new Error('User ' + username + ' does not exist'));
        }
      }
    });
  });
}

user.hashPassword = function(password, cb) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return cb(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return cb(err);
            return cb(null, hash);
        });
    });
}

user.comparePassword = function(candidatePassword, user, cb) {
    bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

user.updateUser = function(user, cb) {
    user.hashPassword(user.password, function(err, hash) {
        if (err) return cb(err);

        user.password = hash;
        
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
                });
            }
        });

    })
};

user.removeUser = function(user, cb) {
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
          });
      }
  });
}