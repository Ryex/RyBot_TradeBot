var rek = require('rekuire');

var crypto = require('crypto');
var async = require('async');

var DB = rek('db');
var gdb = DB.getDb;
var config  = rek('config.js')

var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var Users, User;
module.exports = Users = {};

Users.listUsers = function(query, cb) {
    gdb().collection("users", function(err, collection) {
        if (err) return cb(err);
        collection.find(query).toArray(function(err, users) {
            if (err) return cb(err);
            cb(null, users);
        });
    });
};

Users.findByID = function(id, cb) {
    gdb().collection("users", function(err, collection){
        if (err) return cb(err);
        collection.findOne({_id: DB.ObjectID(id)}, function(err, data) {
            if (err) return cb(err);
            if (data) {
                var u = new User(data);
                return cb(null, u);
            } else {
                return cb(new Error('User ' + id + ' does not exist'));
            }
        });
    });
};

Users.findByUsername = function(username, cb) {
    gdb().collection("users", function(err, collection){
        if (err) return cb(err);
        collection.findOne({username: username.toLowerCase()}, function(err, data) {
            if (err) return cb(err);
            if (data) {
                var u = new User(data);
                return cb(null, u);
            } else {
                return cb(new Error('User ' + username + ' does not exist'));
            }
        });
    });
};

Users.findByAPIKey = function(apikey, cb) {
    gdb().collection("users", function(err, collection){
        if (err) return cb(err);
        collection.findOne({apikey: apikey}, function(err, data) {
            if (err) return cb(err);
            if (data) { 
                var u = new User(data);
                return cb(null, u);
            } else {
                return cb(new Error('API Key Not Found'));
            }
        });
    });
};

Users.hashPassword = function(password, cb) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return cb(err);

        bcrypt.hash(password, salt, function(err, hash) {
            if(err) return cb(err);
            return cb(null, hash);
        });
    });
};

Users.removeUser = function(username, cb) {
    gdb().collection("users", function(err, collection) {
        if (err) return cb(err)
        collection.remove({username: username.toLowerCase()}, function(err, numRemoved) {
            if (err) return cb(err);
            return cb(null, numRemoved);
        });
    });
}

Users.comparePassword = function(candidatePassword, hash_pass, cb) {
    bcrypt.compare(candidatePassword, hash_pass, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

Users.genAPIKey = function(cb) {
    crypto.randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex');
        return cb(null, token);
    });
};

Users.User = User = function (user_obj) {

    if (typeof(user_obj) != 'object') {
        throw new Error("Invalid type for `user_obj`: expected `object`, got `" + typeof(user_obj) + "`");
    }

    if (typeof(user_obj.admin) === 'undefined') user_obj.admin = false;

    if (typeof(user_obj.name) != 'string') {
        throw new Error("Invalid type for `user_obj.name`: expected `string`, got `" + typeof(user_obj.name) + "`");
    }

    if (typeof(user_obj.password) != 'undefined' && typeof(user_obj.password) != 'string' ) {
        throw new Error("Invalid type for `user_obj.password`: expected `string`, got `" + typeof(user_obj.password) + "`");
    }

    if (typeof(user_obj.hash_password) != 'undefined' && typeof(user_obj.hash_password) != 'string' ) {
        throw new Error("Invalid type for `user_obj.hash_password`: expected `string`, got `" + typeof(user_obj.hash_password) + "`");
    }
    
    if (typeof(user_obj.apikey) != 'undefined' && typeof(user_obj.apikey) != 'string' ) {
        throw new Error("Invalid type for `user_obj.apikey`: expected `string`, got `" + typeof(user_obj.apikey) + "`");
    }

    if (typeof(user_obj.admin) != 'boolean') {
        throw new Error("Invalid type for `user_obj.admin`: expected `boolean`, got `" + typeof(name) + "`");
    }

    var self = this;

    self.name = user_obj.name;
    self.username = user_obj.name.toLowerCase();
    self.hash_password = user_obj.hash_password || null;
    self.apikey = user_obj.apikey || undefined;
    self._id = user_obj._id || new DB.ObjectID();

    var user_password = user_obj.password || null;

    self.admin = user_obj.admin;

    self.save = function(cb) {
        var user_obj = {
            _id: self._id,
            name: self.name,
            username: self.username,
            hash_password: self.hash_password,
            apikey: self.apikey,
            admin: self.admin
        };
        gdb().collection("users", function(err, collection) {
            if (err) return cb(err);
            collection.update({_id: self._id}, user_obj, {upsert:true}, function(err, result) {
              if (err) return cb(err);
              return cb(null, result);
            });
        });
    };

    self.delete = function(cb) {
        gdb().collection("users", function(err, collection){
           if (err) return cb(err);
           collection.remove({_id: self._id}, function(err, numRemoved) {
               if (err) return cb(err);
               if (numRemoved > 0) return cb(null, true);
               return cb(new Error("ERROR: User, `" + self.name + "` was not removed"));
           });
        });
    };

    self.setPassword = function (password, cb) {
        Users.hashPassword(password, function(err, hash) {
            if (err) return cb(err);

            self.hash_password = hash;
            return cb(null, true);
        });
    };

    self.testPassword = function(pass, cb) {
        if (!self.hash_password) return cb(null, false);
        Users.comparePassword(pass, self.hash_password, function(err, isMatch) {
           if (err) return cb(err);
           return cb(null, isMatch);
        });
    };

    self.setNewAPIKey = function(cb) {
        Users.genAPIKey(function(err, token) {
            self.apikey = token;
            cb(null, token);
        });
    }

    self.prepare = function(cb) {
        if (user_password) {
            self.setNewAPIKey(function(err, result){
                if (err) return cb(err);
                self.setPassword(user_password, function(err, result){
                    if (err) return cb(err);
                    return cb(null, result);
                });
            })
        }
    };


};

