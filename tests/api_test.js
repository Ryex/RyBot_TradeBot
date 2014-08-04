var rek = require('rekuire');

var vows = require('vows');
var assert = require('assert');

var API = rek('api');

global.DEBUG = true;

//dont worry, these belong to a dummy account on btce
var key = "K61CRFHC-PHU2XHI7-OFXA24S1-Z7GLX6PB-SWK9WTOH";
var secret = "1105ee1643a66bce5cd76664fdfee1b1f08251e9e0c9853634173f61567d68a8";
var privateAPI = API.fetchSyncApi('btce_private', 'btce', true, [key, secret]);

vows.describe('API').addBatch({
    'BTC-e': {
        topic: API.apis,

        'Shold Exist': function(topic) {
            assert.isNotNull(topic);
            assert.isObject(topic.btce);
        }
    }
}).addBatch({
    'BTC-e': {
        topic: API.apis.btce,

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
                            assert.isNull(err);
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
                            assert.isNull(err);
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
                            assert.isNull(err);
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

                        'an object that contains a list of asks': function(err, result) {
                            assert.isNull(err);
                            assert.include(result, 'asks');
                            var first_ask = result.asks[0];
                            assert.lengthOf(first_ask, 2);
                        },

                        'an object that contains a list of bids': function(err, result) {
                            assert.isNull(err);
                            assert.include(result, 'bids');
                            var first_bid = result.bids[0];
                            assert.lengthOf(first_bid, 2);
                        }
                    }
                }
            }
        }
    }
}).addBatch({
    'BTC-e': {
        topic: API.apis.btce,

        'Has a Private API': {
            topic: function(btce) {
                return btce.private;
            },

            'That can be constructed': function(api) {
                assert.isFunction(api);
            }
        },

        'Has a list of possible pairs' : function(btce) {
            assert.isArray(btce.pairs);
            assert.ok(btce.pairs.length > 0);
            assert.isString(btce.pairs[0]);
        }
    }

}).addBatch({
    'BTC-e Has Private API That' : {

        topic: function(api) {
            return privateAPI
        },

        'has a function `getInfo`': {
            topic: function(api) {
                assert.isFunction(api.getInfo);
                return api.getInfo;
            },

            'that when called asynchronously returns': {
                topic: function(getInfo) {
                    getInfo(this.callback);
                },

                'an object that has a return object with a list of `funds`,  key `rights`, `transaction_count`, `open_orders`, and `server_time` ' : function(err, result) {
                    assert.isNull(err);
                    assert.isObject(result);
                    assert.isObject(result.funds);
                    assert.isObject(result.rights);
                    assert.isNumber(result.transaction_count);
                    assert.isNumber(result.open_orders);
                    assert.isNumber(result.server_time);
                }
            }
        },

        'has a function `transHistory`': {
            topic: function(api) {
                assert.isFunction(api.transHistory);
                return api.transHistory;
            },

            'that when called asynchronously returns': {
                topic: function(transHistory) {
                    var perams = {
                        //empty none required
                    };
                    transHistory(perams, this.callback);
                },

                'an object that has a return object that carries a list of transactions (errors, test key has no transactions)': function(err, result) {
                    assert.isObject(err);
                    assert.isUndefined(result);
                }


            }
        },

        'has a function `tradeHistory`': {
            topic: function(api) {
                assert.isFunction(api.tradeHistory);
                return api.tradeHistory;
            },

            'that when called asynchronously returns': {
                topic: function(tradeHistory) {
                    var perams = {
                        //empty none required
                    };
                    tradeHistory(perams, this.callback);
                },

                'an object that has a return object that carries a list of trades (errors, test key has no trades)': function(err, result) {
                    assert.isObject(err);
                    assert.isUndefined(result);
                }
            }
        },

        'has a function `activeOrders`': {
            topic: function(api) {
                assert.isFunction(api.activeOrders);
                return api.activeOrders;
            },

            'that when called asynchronously returns': {
                topic: function(activeOrders) {
                    var pair = 'btc_usd'
                    activeOrders(pair, this.callback);
                },

                'an object that has a return object that carries a list of trades (errors, test key has no orders)': function(err, result) {
                    assert.isObject(err);
                    assert.isUndefined(result);
                }

            }
        },

        'has a function `trade`': {
            topic: function(api) {
                assert.isFunction(api.trade);
                return api.trade;
            },

            'that when called asynchronously returns': {
                topic: function(trade) {
                    var pair = 'btc_usd',
                        type = 'buy',
                        rate = 0.0,
                        amount = 1.0;

                    trade(pair, type, rate, amount, this.callback);
                },

                'an object that carries an error (test key does not have trade permissions)': function(err, result) {
                    assert.isObject(err);
                    assert.isUndefined(result);
                }
            }
        },

        'has a function `cancelOrder`': {
            topic: function(api) {
                assert.isFunction(api.cancelOrder);
                return api.cancelOrder;
            },

            'that when called asynchronously returns': {
                topic: function(cancelOrder) {
                    var order_id = 0
                    cancelOrder(order_id, this.callback);
                },

                'an object that carries an error (test key does not have trade permissions)': function(err, result) {
                    assert.isObject(err);
                    assert.isUndefined(result);
                }
            }
        }
    }

}).export(module)



