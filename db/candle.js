module.exports.CandleProvider = function(db, minutes, pair) {
    var self = this;

    self.db = db;
    self.pair = pair;

    if (minutes == 10) {
        self.coll_name = "10minute_" + self.pair
    } else if (minutes == 30) {
        self.coll_name = "30minute_" + self.pair
    } else {
        self.coll_name = "10minute_" + self.pair
    }


    //get all candles between two dates
    self.getCandles = function(date_start, date_end, callback) {
        var start = date_start.valueOf() / 1000;
        var end = date_end.valueOf() / 100;
        self.getCollecton(function(err, collection){
            if (err) callback(err);
            collection.find({date: { $gt: start, $lt: end}}).sort([['date', 1]]).toArray(function(err, candles){
                if (err) callback(err);
                callback(null, candles);
            })
        })

    }

    self.getCollecton = function(callback) {
        self.db.collection(self.coll_name, function(err, collection) {
            if (err) callback(err);
            else callback(null, collection);
        });
    }
}

