var rek = require("rekuire");

var DB = rek("db");
var gdb = DB.getDb();

module.exports = function(req, res){
    var mins = req.params.mins
    var pair = req.params.pair
    var date_start = new Date(req.params.date_start * 1000)
    var date_end = new Date(req.params.date_end * 1000)

    var provider = new DB.candle.CandleProvider(gdb(), mins, pair)

    provider.getCandles(date_start, date_end, function(err, candles){
        if (err) {
            DB.log("candles_request", err)
            res.send({error: err});
        } else {

            res.send(candles);
        }
    })

};