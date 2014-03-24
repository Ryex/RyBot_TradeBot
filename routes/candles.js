module.exports = function(req, res){
    var mins = req.params.mins
    var pair = req.params.pair
    var date_start = new Date(req.params.date_start * 1000)
    var date_end = new Date(req.params.date_end * 1000)

    provider = new Db.candle.CandleProvider(db, mins, pair)

    provider.getCandles(date_start, date_end, function(err, candles){
        if (err) {
            Db.log("candles_request", err)
            res.send({error: err});
        } else {
            
            res.send(candles);
        }
    })
    
};