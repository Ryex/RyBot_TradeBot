var rek = require('rekuire');

var request = require('request');
var vows = require('vows');
var assert = require('assert');
var async = require('async');

var Browser = require("zombie");

var Config  = rek('config.js');

var app_env = rek('env');
var DB = rek('db');
var gdb = DB.getDb

var startup = rek('startup');

var siteURL = "http://localhost:" + Config.serverPort + "/";

GLOBAL.TESTING = true;




function teardownDB(topic) {
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
        gdb().collection("accounts", function(err, collection) {
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

    async.parallel(tasks, function(err, results) {
        if (err) throw err;
        DB.close()
        return results;
    });


}

vows.describe('Server').addBatch({
    'The first time the server is run' : {
        topic: function() {
            
            this.browser = new Browser();
            this.browser.debug = true;
            
            startup.setupScribe();
            var app = startup.buildApp();
            startup.run(app, this.callback, "test");
        }, 
        
        'and we visit the site' : {
            topic: function() {
                var self = this;
                this.browser.visit(siteURL, this.callback);
            },
            
            'we should get a setup page' : function (err, result) {
                assert.isTrue(this.browser.success);
                assert.equal(this.browser.location.pathname, "/setup");
            },
            
            'if we fill out the form and set up the server' : {
                topic: function(result) {
                    assert.equal("/setup", this.browser.location.pathname);
                    this.browser.
                        fill("user[name]", "TestAdmin").
                        fill("user[pass]", "test1234").
                        fill("user[pass_confirm]", "test1234").
                        fill("app[botName]", "TestBot").
                        pressButton("Submit", this.callback);
                },
                
                'we should be redirected to the login page' :  function (err, result) {
                    assert.isTrue(this.browser.success);
                    assert.equal("/login", this.browser.location.pathname);
                },
                
                'if we then login' : {
                    topic : function (result) {
                        var self = this;
                        assert.equal("/login", this.browser.location.pathname);
                        this.browser.fill("username", "testadmin");
                        this.browser.fill("password", "test1234");
                        this.browser.pressButton("Sign In", function(err, result) {
                            console.log(err, result);
                            self.callback(null);
                        });
                    },
                    
                    'we should get our homepage' : function (err, result) {
                        assert.isTrue(this.browser.success);
                        assert.equal(this.browser.location.pathname, "/");
                        assert.ok(this.browser.query("#greeting"));
                    }
                }
            }
        },
        
        teardown: function () {
            this.browser.close();
        }
    }
}).addBatch({
    'If the server has been running and we visit the site' : {
        topic: function() {
            this.browser = new Browser();
            this.browser.debug = true;
            this.browser.visit(siteURL, this.callback);
        },
        
        'we should be redirected to the login page' :  function (err, result) {
            assert.isNull(err);
            assert.isTrue(this.browser.success);
            assert.equal(this.browser.location.pathname, "/login");
        },
        
        'if we then login' : {
            topic : function () {
                assert.equal(this.browser.location.pathname, "/login");
                this.browser.
                    fill("username", "testadmin").
                    fill("password", "test1234").
                    pressButton("Sign In", this.callback);
            },
            
            'we should get our homepage' : function (err, result) {
                assert.isNull(err);
                assert.isTrue(this.browser.success);
                assert.equal(this.browser.location.pathname, "/");
                assert.ok(this.browser.query("#greeting"));
            },
            
            'if we visit the settings page' : {
                topic : function () {
                    this.browser.visit(siteURL + "settings", this.callback);
                },
                
                'and we fill out the form' : {
                    topic: function () {
                        assert.isTrue(this.browser.success);
                        this.browser.
                            fill("app[botName]", "TestBotAfter").
                            select("app[themeName]", "slate").
                            check("app[autostartAgg]").
                            pressButton("Submit", this.callback);
                    },
                    
                    'the global settings should change' : function (err, result) {
                        assert.isNull(err);
                        assert.isTrue(this.browser.success);
                        assert.equal('slate', global.CONFIG.themeName);
                        assert.equal('TestBotAfter', global.CONFIG.botName);
                        assert.isTrue(global.CONFIG.autostartAgg);
                    }
                    
                    
                }
            }
        },
        
        teardown: function () {
            this.browser.close();
        }
    }
}).addBatch({
    'If we visit a page that does not exist' : {
        topic: function() {
            
            this.browser = new Browser();
            this.browser.debug = true;
            this.browser.visit(siteURL + "notHere", this.callback);
        },
        
        'we should get a Error page' :  function (err, result) {
            assert.isObject(err);
            assert.isFalse(this.browser.success);
            assert.equal(this.browser.statusCode, 404);
        }
        
    }
}).addBatch({
    'If we login ' : {
        topic: function() {
            var self = this;
            
            self.browser = new Browser();
            self.browser.debug = true;
            self.browser.visit(siteURL + "login", function() {
                self.browser.
                    fill("username", "testadmin").
                    fill("password", "test1234").
                    pressButton("Sign In", self.callback);
            });
        },
        
        'we sould find': {
            topic: function() {
                var apikey = this.browser.query("#userapikey")
                this.apikey = apikey._attributes.value._childNodes[0]._nodeValue;
                return this.apikey;
            },
            
            'an apikey hidden in the page':  function (apikey) {
                assert.isString(apikey);
            },
            
            'and then submit a request to api/accounts/list' :  {
                topic: function () {
                    var self = this;
                    request.post(siteURL + "api/accounts/list", function(err, httpResponse, body) {
                        self.callback(err, body);
                    }).form({
                        apikey: self.apikey
                    })
                },
                
                'we sould get a `JSON` list of accounts' : function (err, result) {
                    assert.isNull(err);
                    var jsonRes = JSON.parse(result);
                    assert.isArray(jsonRes);
                }
            }
            
        }

    }
}).addBatch({
    teardown: function() {
        startup.stop(teardownDB);
    }
}).export(module)