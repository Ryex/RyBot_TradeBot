var rek = require("rekuire");
var vows = require('vows');
var assert = require('assert');
var async = require('async');

var app_env = rek('env')
var DB = rek('db');
var gdb = DB.getDb

var test_user_ID;

vows.describe('DB').addBatch({

    'Database' : {
        topic : function () {
            var self = this;
            DB.open(function(err, db_client) {
                // test error opening database
                if (err) return self.callback(err);

                var tasks = [];



                // setup for configs
                tasks.push(function(cb) {
                    gdb().collection("configs", function(err, collection) {
                        //test error opening collection
                        if (err) return cb(err);

                        var config_objs = [
                            {
                                botName: "TestBot",
                                main: false
                            },
                            {
                                botName: "MainTestBot",
                                main: true
                            }
                        ];

                        collection.insert( config_objs, function(err, result) {
                            // test error updating user
                            if (err) return cb(err);
                            return cb(null, result);
                        });
                    });
                });

                // set up for Users
                tasks.push(function(cb) {
                    gdb().collection("users", function(err, collection) {
                        //test error opening collection
                        if (err) return cb(err);


                        var user_objs = [
                            {
                                name: "Test",
                                username: "test",
                                password: "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e",
                                admin: false

                            },
                            {
                                name: "Admin",
                                username: "admin",
                                password: "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e",
                                admin: true
                            }
                        ];

                        collection.insert( user_objs, function(err, result) {
                            // test error updating user
                            if (err) return cb(err);

                            test_user_ID = result[0]._id

                            return cb(null, result);
                        });
                    });
                });

                // setup for accounts
                tasks.push(function(cb) {
                    gdb().collection("accounts", function(err, collection) {
                        //test error opening collection
                        if (err) return cb(err);

                        var account_objs = [
                            {
                                apiName: "btce",
                                apiKey: "test123",
                                assets: {
                                    usd: 0.0,
                                    btc: 0.0
                                }
                            }
                        ];

                        collection.insert( account_objs, function(err, result) {
                            // test error updating user
                            if (err) return cb(err);
                            return cb(null, result);
                        });
                    });
                });

                // setup for signals
                tasks.push(function(cb) {
                    gdb().collection("signals", function(err, collection) {
                        //test error opening collection
                        if (err) return cb(err);

                        var signal_objs = [
                            {
                                apiName: "btce",
                                algorithm: "SMA",
                                data: {}
                            }
                        ];

                        collection.insert( signal_objs, function(err, result) {
                            // test error updating user
                            if (err) return cb(err);
                            return cb(null, result);
                        });
                    });
                });

                // setup for candles
                tasks.push(function(cb) {
                    cb(null, true);
                });

                async.parallel(tasks, function(err, results) {
                    if (err) return self.callback(err);
                    self.callback(null, results);
                });


            }, "test");
        },

        'Configs' : {
            topic : function(results) {
                return DB.Configs;
            },

            'Has a asynchronous `listConfigs` function' : {
                topic: function (configs) {
                    assert.isFunction(configs.listConfigs);
                    configs.listConfigs(this.callback);
                },

                'that lists users in the database' : function(data) {
                    assert.isArray(data);
                }
            },

            'Has a Constructable `Config` object that ...' : {
                topic : function(configs) {
                    var cfg = new configs.Config({
                        botName: "TestBot",
                        main: true
                    });
                    return cfg;
                },

                'Has a `botName` property' : function(config) {
                    console.log("config: ", config)
                    assert.isString(config.botName);
                },

                'Has a `main` property' : function (config) {
                    assert.isBoolean(config.main);
                },

                'Has a `save` function' : function(config) {
                    assert.isFunction(config.save);
                }

            }

        },

        'Users' : {
            topic : function(results) {
                return DB.Users
            },

            'Has a asynchronous `listUsers` function' : {
                topic: function (users) {
                    assert.isFunction(users.listUsers);
                    users.listUsers(this.callback)
                },

                'that lists users in the database' : function(err, data) {
                    assert.isArray(data);
                }
            },

            'Has a asynchronous `findByID` function' : {
                topic: function(users) {
                    assert.isFunction(users.findByID);
                    users.findByID(test_user_ID, this.callback);
                },

                'that returns a user' : function(err, data) {
                    assert.isNull(err);
                    assert.instanceOf(data, DB.Users.User);
                }
            },

            'Has a asynchronous `findByUsername` function' : {
                topic: function(users) {
                    assert.isFunction(users.findByUsername);
                    users.findByUsername("test", this.callback);
                },

                'that returns a user' : function(err, data) {
                    assert.isNull(err);
                    assert.instanceOf(data, DB.Users.User);
                }

            },

            'Has a asynchronous `hashPassword` function that takes a plain text password' : {
                topic: function(users) {
                    assert.isFunction(users.hashPassword);
                    users.hashPassword("test123", this.callback);
                },

                'and returns a hashed version' : function(err, data) {
                    assert.isNull(err);
                    assert.isString(data);
                }
            },

            'Has a asynchronous `comparePassword` function that compairs a plain text password to a stored hashed password' : {
                topic: function(users) {
                    assert.isFunction(users.comparePassword);
                    users.comparePassword("test123", "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e", this.callback);
                },

                'that compairs a plain text password to a stored hashed password' : function(err, data) {
                    assert.isNull(err);
                    assert.isTrue(data);
                }
            },


            'Has a asynchronous `removeUser` function ' : {
                topic: function(users) {
                    assert.isFunction(users.removeUser);
                    users.removeUser("test", this.callback);
                },

                'and when called returns removes a user' : function(err, numRemoved) {
                    assert.isNull(err);
                    assert.isTrue(numRemoved > 0);
                }

            },

            'Has a Constructable `User` object that ...' : {
                topic : function(users) {
                    var u = new users.User({name:"test2", password:"test123", admin:false});
                    return u;
                },

                'Has a `name`' : function(user) {
                    assert.isString(user.name);
                },

                'Has an all lowercase `username`' : function(user) {
                    assert.isString(user.username);
                    assert.isTrue(user.username.toLowerCase() === user.username);
                },

                'Has an `admin` boolean': function(user) {
                    assert.isBoolean(user.admin);
                },

                //TODO: impliment Tests
                'Has a asynchronous `save` function that updates the user in the database' : {
                    topic: function(user) {
                        assert.isFunction(user.save);
                        user.save(this.callback);
                    },

                    'that updates the user in the database' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }

                },

                'Has a asynchronous `delete` function' : {
                    topic: function(user) {
                        var self = this;
                        assert.isFunction(user.delete)
                        user.save(function(err, result) {
                            assert.isNull(err);
                            assert.equal(result, true);

                            user.delete(self.callback);
                        })
                    },

                    'that removes a matching user from the database' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                },

                'Has a asynchronous `setPassword` function that takes a plain text password' : {
                    topic: function(user) {
                        assert.isFunction(user.setPassword);
                        user.setPassword("test123", this.callback);
                    },

                    'and saves a hased password with the user' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }

                },

                'Has a asynchronous `testPassword` function' : {
                    topic: function(user) {
                        var self = this;
                        assert.isFunction(user.testPassword);
                        user.setPassword("test12345", function(err, result) {
                            assert.isNull(err);
                            assert.isTrue(result);
                            user.testPassword("test12345", self.callback);
                        })
                    },

                    'that tests a plain text pass with the saved hash pass' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                },

                'Has a asynchronous `prepare` function that will set up properties of the user like the hash_password' : {
                    topic: function(user) {
                        this.user = user;
                        assert.isFunction(user.prepare);
                        user.prepare(this.callback);
                    },

                    'User has a `hash_password` property now' : function(err, result){
                        assert.isNull(err);
                        assert.equal(result, true);
                        assert.isString(this.user.hash_password);
                    }
                }

            }

        },

        'Accounts' : {
            topic : function(results) {
                return DB.Accounts;
            },
            
            'Has a asynchronous `listAccounts` function' : {
                topic: function (accounts) {
                    assert.isFunction(accounts.listAccounts);
                    accounts.listAccounts(this.callback);
                },
                
                'that lists accounts in the database' : function(err, data) {
                    assert.isNull(err);
                    assert.isArray(data);
                }
            }

        },

        'Signals' : {
            topic : function(results) {
                return DB.Signals;
            }

        },

        'Candles' : {
            topic : function(results) {
                return DB.Candles;
            }

        },

        teardown: function(topic) {
            var tasks = [];

            // drop tables
            tasks.push(function(cb) {
                gdb().collection("configs", function(err, collection) {
                    if (err) return cb(err);
                    collection.drop(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("users", function(err, collection) {
                    if (err) return cb(err);
                    collection.drop(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("accountss", function(err, collection) {
                    if (err) return cb(err);
                    collection.drop(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("signals", function(err, collection) {
                    if (err) return cb(err);
                    collection.drop(function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });

            tasks.push(function(cb) {
                DB.close();
                cb(null, true);
            });

            async.series(tasks, function(err, results) {
                if (err) throw err;
                return results;
            });


        }
    }





}).export(module)