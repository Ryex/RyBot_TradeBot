/* ====================================
 * setup.js
 * - connects to teh database and sets up prerequasit
 * ====================================
 */

var async = require('async');

var db = require('./db').db;
var config = require('./config.js');



function prepare(callback) {
    // Establish connection to db
    db.open(function(err, db) {
        if (err) {
            throw err;
        }

        // a list of tasks that might need to be compleated async to get teh server ready
        tasks = [];

        // Create capped collections with a maximum of 20000 documents for traid pairs we want to track
        // and capped collections for 10 and 30 minuet charts
        for (var i = 0; i < config.pairs.length; i++) {
            var trades_name = "trades_" + config.pairs[i];
            var min10_name = "10minute_" + config.pairs[i];
            var min30_name = "30minute_" + config.pairs[i];


            //force power of 2 allocation
            var forcep2 = function(name) {
                return function(cb){
                    db.command( {collMod: name, usePowerOf2Sizes : true }, function(err, result) {
                         if (err) { 
                            cb(err);
                        } else {
                            console.log("forced power of 2 allocation on :", name, result);
                            cb(null, result);
                        }

                    })
                }   
            }

            // ensure that TTL indexes exist
            var forceTTLindex = function(name) { 
                return function(cb){
                    db.collection(name, function(err, collection) {
                        if (err) {
                            throw err;
                        }
                        //expire after 30 days
                        collection.ensureIndex({ "createdAt": 1 }, { expireAfterSeconds: 1000*60*60*24*30}, function(err, indexName){
                            if (err) { 
                            cb(err);
                            } else {
                                console.log("forced TTL index on:", name, indexName);
                                cb(null, indexName);
                            }
                        })
                    })
                }
            }

            // create our task function
            var trade_coll = function(name) {
                return function(cb){
                    //{capped: true, size: 5242880, max: 20000},
                    db.createCollection(name,  function(err, collection) {
                        if (err) { 
                            cb(err);
                        } else {
                            //capped 
                            console.log("collection created:", collection.collectionName );
                            cb(null, collection);
                        }
                    })
                }
                
            }(trades_name)

            var min10_coll = function(name) {
                return function(cb){
                    //{capped: true, size: 307200, max: 3000},
                    db.createCollection(name,  function(err, collection) {
                        if (err) { 
                            cb(err);
                        } else {
                            //capped 
                            console.log("collection created:", collection.collectionName );
                            cb(null, collection);
                        }
                    })
                }
                
            }(min10_name)

            var min30_coll = function(name) {
                return function(cb){
                    //{capped: true, size: 102400, max: 1000},
                    db.createCollection(name,  function(err, collection) {
                        if (err) { 
                            cb(err);
                        } else {
                            //capped 
                            console.log("collection created:", collection.collectionName );
                            cb(null, collection);
                        }
                    })
                }
                
            }(min30_name)

            //add to task q
            tasks.push(trade_coll);
            tasks.push(forceTTLindex(trades_name))
            tasks.push(min10_coll);
            tasks.push(forceTTLindex(min10_name))
            //tasks.push(forcep2(min10_name))
            tasks.push(min30_coll);
            tasks.push(forceTTLindex(min30_name))
            //tasks.push(forcep2(min30_name))



        }

        // run all our tasks async but in series
        async.series(tasks, function(err, results) {
            if (err) {
                throw err;
            }

            callback();
        })
    });

}



module.exports = {
    prepare: prepare
}