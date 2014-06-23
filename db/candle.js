module.exports.CandleProvider = function(db, api, minutes, pair) {
    var self = this;

    self.db = db;
    self.api = api;
    self.minutes = minutes;
    self.pair = pair;
    self.coll_name = "";

    self.coll_name.concat.apply(self.coll_name, [self.api, "_", self.minutes, "_minute_", self.pair])

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

