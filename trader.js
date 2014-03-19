var BTCE = require('btc-e');

var Db = require(global.appdir + '/db');
var db = Db.db;
var config = require(global.appdir + '/config.js');

//var btceTrade = new BTCE("YourApiKey", "YourSecret"),
// No need to provide keys if you're only using the public api methods.
var btcePublic = new BTCE();
var TradeUpdater = function (pair) {
    var self = this;

    self.pair = pair;

    self.updating = false;

    self.interval = null;

    self.highest_tid = 0;

    self.start_updating = function() {

        // updates the trades now
        self.update_trades();

        // set interval to keep them updated
        if (!self.interval && !self.updating) {
            setInterval(function() {
                self.update_trades()
            }, config.traderTradesSleep * 1000)
        }

    };

    self.stop_updating = function() {
        if (self.interval || self.updating) {
            clearInterval(interval);
            self.interval = null;

        }
    };

    self.update_trades = function() {

        //fetch the last 150 trades
        btcePublic.trades(self.pair, function(err, trades) {
            if (err) {
                throw err;
            }

            db.collection("trades_" + self.pair, function(err, collection) {
                if (err) {
                    throw err;
                }

                //get highest id
                collection.find({tid: { $gt: self.highest_tid } }).sort([['tid', -1]]).nextObject(function(err, item) {
                    if (err) {
                        throw err;
                    }

                    if (item) {
                      self.highest_tid = item.tid;  
                    }

                    //find the new trades
                    var new_trades = [];
                    for (var i = 0; i < trades.length; i++) {
                        var trade = {
                            date: trades[i].date, 
                            price: trades[i].price, 
                            amount: trades[i].amount, 
                            tid: trades[i].tid, 
                            type: trades[i].trade_type,
                            createdAt: new Date(trades[i].date * 1000)
                        };
                        if (trade.tid > self.highest_tid) {
                            new_trades.push(trade);
                        }
                    }

                    console.log("New trades:", new_trades.length);

                    //add all new trades to the db
                    if (new_trades.length > 0) { 
                        collection.insert(new_trades, function(err, result) {
                            if (err) {
                                throw err;
                            }

                            console.log("added trades to db, result:", result)
                            self.update_candles();
                        });
                    }

                });

            });            
        });
    };

    self.update_candles = function() {
        db.collection("trades_" + self.pair, function(err, trade_coll) {
            if (err) {
                throw err;
            }

            var buildCandle = function(trades, date) {
                
                var candle = {
                    date: Math.floor(date.valueOf() / 1000), 
                    open: 0, 
                    high: 0, 
                    low: 0, 
                    close: 0, 
                    bid_vol: 0, 
                    ask_vol: 0, 
                    count: 0, 
                    avg: 0,
                    tid_start: 0,
                    tid_end: 0,
                    createdAt: date
                };
                
                for (var i = 0; i < trades.length; i++) {
                    var trade = trades[i];
                    if (i == 0) {
                        candle.open = trade.price
                        candle.low = trade.price
                        candle.tid_start = trade.tid
                    }
                    if (candle.high < trade.price) {
                        candle.high = trade.price
                    }
                    if (candle.low > trade.price){
                        candle.low = trade.price
                    }
                    if (trade.type === 'bid') {
                        candle.bid_vol += trade.amount
                    }
                    if (trade.type === 'ask') {
                        candle.ask_vol += trade.amount
                    }
                    if (i == trades.length - 1) {
                        candle.close = trade.price
                        candle.tid_end = trade.tid
                    }
                    candle.count++
                    candle.avg += trade.price;
                }
                
                candle.avg = candle.avg / candle.count

                return candle

            }
            
            //10 minute candles
            var d10 = new Date()
            var mins10 = Math.floor(d10.getMinutes() / 10) * 10
            d10.setMinutes(mins10)
            d10.setSeconds(0)
            trade_coll.find({date: { $gt: Math.floor(d10.valueOf() / 1000) }}).sort([['tid', 1]]).toArray(function(err, trades){
                if (err) {
                    throw err;
                } 
                if (trades.length > 0) {
                    db.collection("10minute_" + self.pair, function(err, m10_coll) {
                        if (err) {
                            throw err;
                        }
                        var candle = buildCandle(trades, d10);
                        m10_coll.update({date: Math.floor(d10.valueOf() / 1000)}, candle, {upsert:true, w: 1}, function(err, result) {
                            if (err) {
                                throw err;
                            } 

                            console.log("Updated 10 min candle:", d10, "Result:", result);
                        });
                    });
                }

            });

            //30 minute candles
            var d30 = new Date()
            var mins30 = Math.floor(d30.getMinutes() / 30) * 30
            d30.setMinutes(mins30)
            d30.setSeconds(0)
            trade_coll.find({date: { $gt: Math.floor(d30.valueOf() / 1000) }}).sort([['tid', 1]]).toArray(function(err, trades){
                if (err) {
                    throw err;
                }
                if (trades.length > 0) { 
                    db.collection("30minute_" + self.pair, function(err, m30_coll) {
                        if (err) {
                            throw err;
                        }
                        var candle = buildCandle(trades, d30);
                        m30_coll.update({date: Math.floor(d30.valueOf() / 1000)}, candle, {upsert:true, w: 1}, function(err, result) {
                            if (err) {
                                throw err;
                            } 

                            console.log("Updated 30 min candle:", d30, "Result:", result);
                        });
                    });
                    
                }
            });

        });

    };
}

var pairUpdaters = {}

for (var i = 0; i < config.pairs.length; i++) {
    var updater = new TradeUpdater(config.pairs[i]);
    pairUpdaters[config.pairs[i]] = updater;
}


// Note: Could use "btceTrade" here as well.
/*btcePublic.ticker("btc_usd", function(err, data) {
    if (err) {
      throw err;
    }

    console.log(data);
});*/

// btcePublic.ticker("ltc_usd", function(err, data) {
//     if (err) {
//       throw err;
//     }

//     console.log(data);
// });

// btcePublic.ticker("ltc_btc", function(err, data) {
//     if (err) {
//       throw err;
//     }

//     console.log(data);
// });

module.exports = {
    pairUpdaters: pairUpdaters
}