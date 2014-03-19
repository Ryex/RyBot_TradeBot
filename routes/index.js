
/*
 * GET home page.
 */

var Db = require(global.appdir + '/db');
var db = Db.db;
var config  = require(global.appdir + '/config.js');

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.candles = function(req, res){
    var mins = req.params.mins
    var pair = req.params.pair
    var date_start = new Date(req.params.date_start * 1000)
    var date_end = new Date(req.params.date_end * 1000)

    provider = new Db.candle.CandleProvider(db, mins, pair)

    provider.getCandles(date_start, date_end, function(err, candles){
        if (err) res.send("error:", err);
        res.send(candles);
    })
    
};