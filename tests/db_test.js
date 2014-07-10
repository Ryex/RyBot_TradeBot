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
                    return new configs.Config();
                },

                'Has a `botName` property' : function(config) {
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

                'that lists users in the database' : function(data) {
                    assert.isArray(data);
                }
            },

            'Has a asynchronous `findByID` function' : {
                topic: function(user) {
                    assert.isFunction(user.findByID);
                    user.findByID(test_user_ID, this.callback);
                },

                'that returns a user' : function(err, data) {
                    assert.instanceOf(data, DB.Users.User);
                }
            },
            
            //TODO: impliment Tests
            'Has a asynchronous `findByUsername` function that returns a error' : {
                
            },
            
            'Has a asynchronous `hashPassword` function that takes a plain text password and returns a hashed version' : {
                
            },
            
            'Has a asynchronous `comparePassword` function that compairs a plain text password to a stored hashed password' : {
                
            },

            
            'Has a asynchronous `removeUser` function that removes a user form the database by username' : {
                
            },

            'Has a Constructable `User` object that ...' : {
                topic : function(users) {
                    var u = new users.User({name:"test", password:"test123", admin:false});
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
                    
                },
                
                'Has a asynchronous `delete` function that removes a matching user from the database (only works with _ID)' : {
                    
                },
                
                'Has a asynchronous `setPassword` function that takes a plain text password and saves a hased password with the user' : {
                    
                },
                
                'Has a asynchronous `testPassword` function that tests a plain text pass with the saved hash pass' : {
                    
                },
                
                'Has a asynchronous `prepare` function that will set up properties of the user like the hash_password' : {
                    
                    
                    'User has a `hash_password` property now' : {
                        
                    }
                }

            }

        },

        'Accounts' : {
            topic : function(results) {
                return DB.Accounts;
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