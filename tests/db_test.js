var rek = require('rekuire');
var vows = require('vows');
var assert = require('assert');
var async = require('async');

var app_env = rek('env')
var DB = rek('db');
var gdb = DB.getDb

vows.describe('DB').addBatch({
    'Database' : {
        topic : function() {
            return DB;
        },

        'Has `open` function' : function(db) {
           assert.isFunction(db.open);
        },

        'Has `close` function' : function(db) {
            assert.isFunction(db.close);
        },

        'Has `getDb` function' : function(db) {
            assert.isFunction(db.getDb);
        },

        'Has `forceTTLindex` function' : function(db) {
            assert.isFunction(db.forceTTLindex);
        },

        'Has `forceUnique` function' : function(db) {
            assert.isFunction(db.forceUnique);
        },

        'Has `forceP2` function' : function(db) {
            assert.isFunction(db.forceP2);
        },

        'Has `createCollection` function' : function(db) {
            assert.isFunction(db.createCollection);
        },

        'Has `Accounts` object' : function(db) {
            assert.isObject(db.Accounts);
        },

        'Has `Candles` object' : function(db) {
            assert.isObject(db.Candles);
        },

        'Has `Configs` object' : function(db) {
            assert.isObject(db.Configs);
        },

        'Has `Signals` object' : function(db) {
            assert.isObject(db.Signals);
        },

        'Has `Pairs` object' : function(db) {
            assert.isObject(db.Pairs);
        },

        'Has `ObjectID` function' : function(db) {
            assert.isFunction(db.ObjectID);
        },

        'Has `Binary` function' : function(db) {
            assert.isFunction(db.Binary);
        },

        'Has `GridStore` function' : function(db) {
            assert.isFunction(db.GridStore);
        },

        'Has `Grid` function' : function(db) {
            assert.isFunction(db.Grid);
        },

        'Has `Code` function' : function(db) {
            assert.isFunction(db.Code);
        },

        'Has `BSON` function' : function(db) {
            assert.isFunction(db.BSON);
        }

    }
}).addBatch({

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
                                name: "Admin",
                                username: "admin",
                                password: "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e",
                                admin: true
                            }
                        ];

                        collection.insert( user_objs, function(err, result) {
                            // test error updating user
                            if (err) return cb(err);

                            return cb(null, result);
                        });
                    });
                });

                // setup for accounts
                tasks.push(function(cb) {
                    gdb().collection("accounts", function(err, collection) {
                        //test error opening collection
                        if (err) return cb(err);
                        var d = new Date();
                        var account_objs = [
                            {
                                apiName: "btce",
                                apiKey: "46G9R9D6-WJ77XOIP-XH9HH5VQ-A3XN3YOZ-8T1R8I8T", //no these dont actualy work
                                apiSecret: "e1938fn37dn9a0dn2jmf09q4cvngh2387e4nan02o0enqandf029i824bq8c8m8s", //no these dont actualy work
                                assets: {
                                    'usd': [ [Math.floor(d.valueOf() / 1000), 302.56] ],
                                    'btc': [ [Math.floor(d.valueOf() / 1000), 1.23] ],
                                    'ltc': [ [Math.floor(d.valueOf() / 1000), 1] ]
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


            }, "test"); // use the test db
        },

        'Configs' : {
            topic : function(results) {
                return DB.Configs;
            },

            'Has a asynchronous `listConfigs` function' : {
                topic: function (configs) {
                    assert.isFunction(configs.listConfigs);
                    configs.listConfigs({}, this.callback);
                },

                'that lists users in the database' : function(data) {
                    assert.isArray(data);
                }
            },

            'Has a Constructable `Config` object that ...' : {
                topic : function(configs) {
                    assert.isFunction(configs.Config);
                    var cfg = new configs.Config({
                        botName: "TestBot",
                        main: true
                    });
                    return cfg;
                },

                'Has an `_id`' : function(config) {
                    assert.instanceOf(config._id, DB.ObjectID);
                },

                'Has a `botName` property' : function(config) {
                    assert.isString(config.botName);
                },

                'Has a `main` property' : function (config) {
                    assert.isBoolean(config.main);
                },

                'Has an asynchronous `save` function' :  {
                    topic: function(config) {
                        assert.isFunction(config.save);
                        config.save(this.callback);
                    },

                    'That returns it\'s success' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                }

            }

        },

        'Users' : {
            topic : function(results) {
            var self = this;
                var usr_obj = {
                    name: "Test",
                    username: "test",
                    password: "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e",
                    admin: false

                };
                gdb().collection("users", function(err, collection) {
                    var cb = self.callback;
                    //test error opening collection
                    if (err) return cb(err);

                    collection.insert( usr_obj, function(err, result) {
                        // test error updating user
                        if (err) return cb(err);
                        self.test_user_ID = result[0]._id;
                        return cb(null, DB.Users);
                    });
                });
            },

            'Has an asynchronous `listUsers` function' : {
                topic: function (users) {
                    assert.isFunction(users.listUsers);
                    users.listUsers({}, this.callback)
                },

                'that lists users in the database' : function(err, data) {
                    assert.isArray(data);
                }
            },

            'Has an asynchronous `findByID` function' : {
                topic: function(users) {
                    assert.isFunction(users.findByID);
                    users.findByID(this.test_user_ID, this.callback);
                },

                'that returns a user' : function(err, data) {
                    assert.isNull(err);
                    assert.instanceOf(data, DB.Users.User);
                }
            },

            'Has an asynchronous `findByUsername` function' : {
                topic: function(users) {
                    assert.isFunction(users.findByUsername);
                    users.findByUsername("admin", this.callback);
                },

                'that returns a user' : function(err, data) {
                    assert.isNull(err);
                    assert.instanceOf(data, DB.Users.User);
                }

            },

            'Has an asynchronous `hashPassword` function that takes a plain text password' : {
                topic: function(users) {
                    assert.isFunction(users.hashPassword);
                    users.hashPassword("test123", this.callback);
                },

                'and returns a hashed version' : function(err, data) {
                    assert.isNull(err);
                    assert.isString(data);
                }
            },

            'Has an asynchronous `comparePassword` function that compairs a plain text password to a stored hashed password' : {
                topic: function(users) {
                    assert.isFunction(users.comparePassword);
                    users.comparePassword("test123", "$2a$10$Bfkwf/5Z1PRoUegVUm86Z.61Tr1DlD6FNuZnLOgZCoJq6UYkHKP/e", this.callback);
                },

                'that compairs a plain text password to a stored hashed password' : function(err, data) {
                    assert.isNull(err);
                    assert.isTrue(data);
                }
            },


            'Has an asynchronous `removeUser` function ' : {
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
                    assert.isFunction(users.User);
                    var u = new users.User({name:"test2", password:"test123", admin:false});
                    return u;
                },

                'Has an `_id`' : function(user) {
                    assert.instanceOf(user._id, DB.ObjectID);
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

                'Has an asynchronous `delete` function' : {
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

                'Has an asynchronous `setPassword` function that takes a plain text password' : {
                    topic: function(user) {
                        assert.isFunction(user.setPassword);
                        user.setPassword("test123", this.callback);
                    },

                    'and saves a hased password with the user' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }

                },

                'Has an asynchronous `testPassword` function' : {
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

                'Has an asynchronous `prepare` function that will set up properties of the user like the hash_password' : {
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

            'Has an asynchronous `listAccounts` function' : {
                topic: function (accounts) {
                    assert.isFunction(accounts.listAccounts);
                    accounts.listAccounts({}, this.callback);
                },

                'that lists accounts in the database' : function(err, data) {
                    assert.isNull(err);
                    assert.isArray(data);
                }
            },

            'Has a Constructable `Account` object that...' : {
                topic : function(accounts) {
                    assert.isFunction(accounts.Account);
                    var d = new Date();
                    var acc = new accounts.Account({
                        accountName: "testAccount",
                        apiName: "btce",
                        apiKey: "46G9R9D6-WJ77XOIP-XH9HH5VQ-A3XN3YOZ-8T1R8I8T", //no these dont actualy work
                        apiSecret: "e1938fn37dn9a0dn2jmf09q4cvngh2387e4nan02o0enqandf029i824bq8c8m8s", //no these dont actualy work
                        assets: {
                            'usd': [ [Math.floor(d.valueOf() / 1000), 302.56] ],
                            'btc': [ [Math.floor(d.valueOf() / 1000), 1.23] ],
                            'ltc': [ [Math.floor(d.valueOf() / 1000), 1] ]
                        }
                    });
                    return acc;
                },

                'Has an `_id`' : function(account) {
                    assert.instanceOf(account._id, DB.ObjectID);
                },

                'Has an `accountName`' : function(account) {
                    assert.isString(account.accountName);
                },

                'Has an `apiName`' : function(account) {
                    assert.isString(account.apiName);
                },

                'Has an `apiKey`' : function(account) {
                    assert.isString(account.apiKey);
                },

                'Has an `apiSecret`' : function(account) {
                    assert.isString(account.apiSecret);
                },

                'Has an Assets object that holds a map of account assets' : {
                    topic: function(account) {
                        assert.isObject(account.assets);
                        return account.assets;
                    },

                    'that holds lists of daily balences' : function (assets) {
                        for (var p in assets) {
                            if (assets.hasOwnProperty(p)) {
                                assert.isArray(assets[p]);
                                for (var i = 0; i < assets[p].length; i++) {
                                    assert.isArray(assets[p][i]);
                                }
                            }
                        }
                    }
                },

                'Has an asynchronous `save` function' :  {
                    topic: function(account) {
                        assert.isFunction(account.save);
                        account.save(this.callback);
                    },

                    'That returns it\'s success' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                }

            }

        },

        'Signals' : {
            topic : function(results) {
                return DB.Signals;
            },

            'Has an asynchronous `listSignals` function' : {
                topic : function(signals) {
                    assert.isFunction(signals.listSignals);
                    signals.listSignals({}, this.callback);
                },

                'that lists signals in the database for an account' : function(err, data){
                    assert.isNull(err);
                    assert.isArray(data);
                }
            },

            'Has a Constructable `Signal` object that...' : {
                topic: function(signals) {
                    assert.isFunction(signals.Signal);
                    var sig = new signals.Signal({
                        accountName: "testAccount",
                        signalName: "testSignal",
                        pairName: "btc_usd",
                        apiName: "btce",
                        algorithm: "SMA",
                        actions: [
                            {
                                buy: {
                                    btc: "10%"
                                }
                            }
                        ]
                    });
                    return sig;
                },

                'Has an `_id`' : function(signal) {
                    assert.instanceOf(signal._id, DB.ObjectID);
                },

                'Has an `accountName`' : function(signal) {
                    assert.isString(signal.accountName);
                },

                'Has a `signalName`' : function(signal) {
                    assert.isString(signal.signalName);
                },

                'Has a  `pairName`' : function(signal) {
                    assert.isString(signal.pairName);
                },

                'Has an `apiName`' : function(signal) {
                    assert.isString(signal.apiName);
                },

                'Has an `algorithm`' : function(signal) {
                    assert.isString(signal.algorithm);
                },

                'Has an `actions` array' : function(signal) {
                    assert.isArray(signal.actions);
                },

                'Has an asynchronous `save` function' :  {
                    topic: function(signal) {
                        assert.isFunction(signal.save);
                        signal.save(this.callback);
                    },

                    'That returns it\'s success' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                }
            }

        },

        'Candles' : {
            topic : function(results) {
                return DB.Candles;
            }

        },

        'Pairs' : {
            topic : function(results) {
                return DB.Pairs;
            },

            'Has an asynchronous `listPairs` function': {
                topic: function(pairs) {
                    assert.isFunction(pairs.listPairs);
                    pairs.listPairs({}, this.callback);
                },

                'that lists pairs set up in the database' : function(err, data) {
                    assert.isNull(err);
                    assert.isArray(data);
                }
            },

            'Has a Constructable `Pair` object that...' : {
                topic: function(pairs) {
                    var par = new pairs.Pair({
                        pairName: "btc_usd",
                        apiName: "btce",
                        active: true
                    });
                    return par;
                },

                'Has an `_id`' : function(pair) {
                    assert.instanceOf(pair._id, DB.ObjectID);
                },

                'Has an `apiName`' : function(pair) {
                    assert.isString(pair.apiName);
                },

                'Has a `pairName`' : function(pair) {
                    assert.isString(pair.pairName);
                },

                'Has an `active` flag' : function(pair) {
                    assert.isBoolean(pair.active);
                },

                'Has an asynchronous `save` function' :  {
                    topic: function(pair) {
                        assert.isFunction(pair.save);
                        pair.save(this.callback);
                    },

                    'That returns it\'s success' : function(err, result) {
                        assert.isNull(err);
                        assert.equal(result, true);
                    }
                }
            }
        },

        teardown: function(topic) {
            var tasks = [];
            // remove tables
            tasks.push(function(cb) {
                gdb().collection("configs", function(err, collection) {
                    if (err) return cb(err);
                    collection.remove({}, function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("users", function(err, collection) {
                    if (err) return cb(err);
                    collection.remove({}, function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("accounts", function(err, collection) {
                    if (err) return cb(err);
                    collection.remove({}, function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });
            tasks.push(function(cb) {
                gdb().collection("signals", function(err, collection) {
                    if (err) return cb(err);
                    collection.remove({}, function(err, result) {
                        if (err) return cb(err);
                        return cb(null, result);
                    });
                });
            });

            async.parallel(tasks, function(err, results) {
                if (err) throw err;
                return results;
            });


        }
    }





}).export(module)