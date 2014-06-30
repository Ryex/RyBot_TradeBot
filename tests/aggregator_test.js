var vows = require('vows');
var assert = require('assert');

var API = require('../api');

var aggregator = require('../aggregator');

var api = new API.btce.public();

vows.describe('Aggregator').addBatch({

    'Aggregator': {
        topic: function() {
            return aggregator;
        },

        'Has a `active_intervals` function that returns a list of named intervals': function(agg) {
            assert.isFunction(agg.active_intervals);
            assert.isObject(agg.active_intervals())
        },

        'Has a `add` function that takes a time out, an API function, and a process function': function (agg) {
            assert.isFunction(agg.add);
            assert.isBoolean(agg.add("test", 10, function(cb) {
                console.log("Test interval")
            }, function(data) {
                console.log("Test Process Function")
            }));
            assert.include(agg.active_intervals(), "test");
        },

        'Has a `remove` function that takes a name and removes a interval': function(agg) {
            assert.isFunction(agg.remove);
            agg.add("test", 10, function(cb) {
                console.log("Test interval")
            }, function(data) {
                console.log("Test Process Function")
            });
            assert.include(agg.active_intervals(), "test");
            assert.isBoolean(agg.remove("test"));
            assert.isEmpty(agg.active_intervals());
        },

        'Has Process Functions For ...' :  {
            topic: function(agg) {
                return agg.process;
            },

            'Assets' : {

                topic: function(process) {
                    return process.assets;
                },

                'Profits' : function(assets) {
                    assert.isFunction(assets.profits)
                }

            },

            'Pairs': {
                topic: function (process) {
                    return process.pairs;
                },

                'Trades': function(pairs) {
                    assert.isFunction(pairs.trades);
                },

                'Candles': function(pairs) {
                    assert.isFunction(pairs.candles);
                },

                'Signals': {
                    topic: function(pairs) {
                        return pairs.signals
                    },

                    'SMA': function(signals) {
                        assert.isFunction(signals.SMA);
                    },

                    'WMA': function(signals) {
                        assert.isFunction(signals.WMA);
                    },

                    'EMA': function(signals) {
                        assert.isFunction(signals.EMA);
                    }
                }
            }
        }
    }
}).export(module)