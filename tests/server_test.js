var rek = require('rekuire');

var vows = require('vows');

var assert = require('assert');

var async = require('async');


var Config  = rek('config.js');



var Browser = require("zombie");

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
            
            startup.setupScribe();
            var app = startup.buildApp();
            startup.run(app, this.callback, "test");
        }, 
        
        'and we visit the site' : {
            topic: function() {
                var self = this;
                this.browser.visit(siteURL, function(err, stuff){
                    self.callback(err, stuff)
                    
                });
            },
            
            'we should get a setup page' : function () {
                assert.isTrue(this.browser.success);
                assert.equal(this.browser.location.pathname, "/setup");
            },
            
            'if we fill out the form and set up the server' : {
                topic: function() {
                    assert.equal(this.browser.location.pathname, "/setup");
                    this.browser.
                        fill("user[name]", "TestAdmin").
                        fill("user[pass]", "test1234").
                        fill("user[pass_confirm]", "test1234").
                        fill("app[botName]", "TestBot").
                        pressButton("Submit", this.callback);
                },
                
                'we should be redirected to the login page' :  function () {
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
                    
                    'we should get our homepage' : function () {
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
    'If  we visit a page that does not exist' : {
        topic: function() {
            
            this.browser = new Browser();
            this.browser.visit(siteURL + "notHere", this.callback);
        },
        
        'we should get a Error page' :  function (err, result) {
            assert.isObject(err);
            assert.isFalse(this.browser.success);
            assert.equal(this.browser.statusCode, 404);
        }
        
    }
}).addBatch({
    teardown: function() {
        startup.stop(teardownDB);
    }
}).export(module)