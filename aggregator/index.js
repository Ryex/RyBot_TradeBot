var aggregator, process, assets, pairs, signals;
module.exports = aggregator = {};

// track active intervals
aggregator.intervals = {}

aggregator.active_intervals = function() {
    return aggregator.intervals;
}

/*******
 * add
 *
 * adds a interval with the specifed time out.
 *
 * when called the interval will call the passed task function passing a call back to accept an error or the result data
 * when the callback is called in the task function the passed data will be passed to the process function.
 *
 * The ID of the interval is saved with the passed name
 ********/
aggregator.add = function(name, timeout, task, process) {
    if (aggregator.intervals[name]) {
        var err = new Error("An interval by the name `" + name + "` already exists");
        throw err;
    }
    var id = setInterval(function(){
        task(function(data){
            process(data)
        })
    }, timeout);
    aggregator.intervals[name] = id;
    return true
};

/*******
 * remove
 *
 * removes and clears a saved interval with the passed name.
 ********/
aggregator.remove = function(name) {
    if (aggregator.intervals[name]) {
        var id = aggregator.intervals[name];
        clearInterval(id);
        delete aggregator.intervals[name];
        return true
    } else {
        var err = new Error("No interval exists with `" + name + "`");
        throw err;
    }
}

aggregator.process = process = {};

process.assets = assets = {};

// Profits
assets.profits = function () {

}

process.pairs = pairs = {};

// trades
pairs.trades = function () {

}

// candles
pairs.candles = function () {

}

pairs.signals = signals ={};

// SMA
signals.SMA = function () {

}

// WMA
signals.WMA = function () {

}

// EMA
signals.EMA = function () {

}

