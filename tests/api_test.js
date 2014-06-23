var vows = require('vows');
var assert = require('assert');

var API = require('../api');


vows.describe('API').addBatch({
    'BTC-e': {
        topic: API,

        'Shold Exist': function(topic) {
            assert.isNotNull(topic);
            assert.isObject(topic.btce);
        }
    }
}).addBatch({
    'BTC-e': {
        topic: API.btce,

        'Has a Public API': {
            topic: function(btce) {
                return btce.public;
            },

            'That can be constructed': function(api) {
                assert.isFunction(api);
            },

            'That': {
                topic: function(api) {
                    return new api();
                },

                'has a function `fee`': {
                    topic: function(api) {
                        return api.fee
                    },

                    'that when called asynchronously returns': {
                        topic: function(fee) {
                            fee('btc_usd', this.callback);
                        },

                        'a number': function(err, result) {
                            assert.isNumber(result);
                        },

                    }
                }, 

                'has a function `ticker`': {
                    topic: function(api) {
                        return api.ticker;
                    },

                    'that when called asynchronously returns': {
                        topic: function(ticker) {
                            ticker('btc_usd', this.callback);
                        },

                        'a ticker object': function(err, result) {
                            assert.isObject(result);
                            assert.include(result, 'high');
                            assert.include(result, 'low');
                            assert.include(result, 'avg');
                            assert.include(result, 'vol');
                            assert.include(result, 'vol_cur');
                            assert.include(result, 'last');
                            assert.include(result, 'buy');
                            assert.include(result, 'sell');
                            assert.include(result, 'updated');
                            assert.include(result, 'server_time');
                        },

                    }
                },

                'has a function `trades`': {
                    topic: function(api) {
                        return api.trades;
                    },

                    'that when called asynchronously returns': {
                        topic: function(trades) {
                            trades('btc_usd', this.callback);
                        },

                        'a list of trades': function(err, result){
                            assert.isArray(result);
                            var first = result[0];
                            assert.include(first, 'date');
                            assert.include(first, 'price');
                            assert.include(first, 'amount');
                            assert.include(first, 'tid');
                            assert.include(first, 'price_currency');
                            assert.include(first, 'item');
                            assert.include(first, 'trade_type');
                        }
                    }

                },

                'has a function `depth`': {
                    topic: function(api) {
                        return api.depth;
                    },

                    'that when called asynchronously returns': {
                        topic: function(depth) {
                            depth('btc_usd', this.callback);
                        },

                        'an object that': {
                            topic: function(result) {
                                return result;
                            },

                            'contains a list of asks': function(result) {
                                assert.include(result, 'asks');
                                var first_ask = result.asks[0];
                                assert.lengthOf(first_ask, 2);
                            },

                            'contains a list of bids': function(result) {
                                assert.include(result, 'bids');
                                var first_bid = result.bids[0];
                                assert.lengthOf(first_bid, 2);
                            }

                        }
                    }
                }
            }
        },

        'Has Private API': {
            topic: function(btce) {
                return btce.private;
            },

            'That can be constructed': function(api) {
                assert.isFunction(api);
            },

            'That ...': {
                topic: function(api) {
                    return new api();
                },
                'responds to `fee`': function(api) {
                    assert.isFunction(api.fee);
                },

                'responds to `ticker`': function(api) {
                    assert.isFunction(api.ticker);
                },

                'responds to `trades`': function(api) {
                    assert.isFunction(api.trades);
                },

                'responds to `depth`': function(api) {
                    assert.isFunction(api.depth);
                },

                'responds to `getInfo`': function(api) {
                    assert.isFunction(api.getInfo);
                },

                'responds to `transHistory`': function(api) {
                    assert.isFunction(api.transHistory);
                },

                'responds to `tradeHistory`': function(api) {
                    assert.isFunction(api.tradeHistory);
                },

                'responds to `activeOrders`': function(api) {
                    assert.isFunction(api.activeOrders);
                },

                'responds to `trade`': function(api) {
                    assert.isFunction(api.trade);
                },

                'responds to `cancelOrder`': function(api) {
                    assert.isFunction(api.cancelOrder);
                }
            }

            
        },

        'Has a list of possible pairs' : function(btce) {
            assert.isArray(btce.pairs);
            assert.ok(btce.pairs.length > 0);
            assert.isString(btce.pairs[0]);
        }
    }

}).export(module)



