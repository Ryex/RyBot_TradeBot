var async = require('async');


//actes as a wrapper for the passed api
module.exports = function(obj) {
    
    var self = this;
    
    var q = async.queue(function (task, callback) {
        var args = task.args;
        args.push(function(err, data){
            task.cb(err, data);
            if (err) return callback(err);
            callback();
        })
        obj[task.func].apply(obj, args);
    }, 1);
    
    var keys = Object.keys(obj);
    
    var buildFuncWrapper = function(i) {
       self[keys[i]] = function() {
            var args = Array.prototype.slice.call(arguments);
            var task = {
                func: keys[i],
                args: args.slice(0, args.length - 1),
                cb: args.slice(args.length - 1, args.length)[0]
            };
            q.push(task, function(){
                if (global.DEBUG) console.log("[SYNC WRAPPER] finished wrapped call to: ", keys[i]);
            })
        } 
    }
    
    var buildPropWrapper = function(i) {
        Object.defineProperty(self, keys[i], {
            get: function () { return obj[keys[i]]},
            writable : false,
            enumerable: true
        })
    }
    
    for (var i = 0; i < keys.length; i++) {
        if (typeof(obj[keys[i]]) === "function" ) {
            buildFuncWrapper(i);
        } else {
            buildPropWrapper(i);
        }
    }
}