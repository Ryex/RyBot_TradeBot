
var BTCE = require('btc-e');


var pairs = [
    'btc_usd',
    'btc_rur',
    'btc_eur',
    'ltc_btc',
    'ltc_usd',
    'ltc_rur',
    'ltc_eur',
    'nmc_btc',
    'nmc_usd',
    'nvc_btc',
    'nvc_usd',
    'usd_rur',
    'eur_usd',
    'trc_btc',
    'ppc_btc',
    'ftc_btc'
];



var publicAPI = function () {

    var self = this;

    var api = new BTCE();

    // fetches the per transation fee
    self.fee = function(pair, callback) {
        api.fee(pair, function(err, result){
            callback(err, result['trade']);
        });
    };

    // fetches a ticker summery
    self.ticker = function(pair, callback) {
        api.ticker(pair, function(err, result) {
            callback(err, result["ticker"]);
        });
    };

    // fetches the last trades
    self.trades = function(pair, callback) {
        api.trades(pair, function(err, result) {
            callback(err, result);
        });
    };

    // gets trade depth information
    self.depth = function(pair, callback) {
        api.depth(pair, function(err, result) {
            callback(err, result);
        });
    };

};

var privateAPI = function(key, secret) {
    var self = this;
    
    var nextNonceFunc = function() {
        var d = new Date();
        var seconds = Math.floor(d.getTime() / 1000);
        var nonce = seconds;
        return function() {
            return nonce++;
        }
    }();
    
    var api = new BTCE(key, secret, nextNonceFunc);

    //information about the user's current balance
    self.getInfo = function (callback) {
        api.getInfo(callback);
    };

    //returns the transactions history.
    /*
     * Parameters:
     * parameter   required? description                                         type        example value
     * from        No        The ID of the transaction to start displaying with  numerical   0
     * count       No        The number of transactions for displaying           numerical   1,000
     * from_id     No        The ID of the transaction to start displaying with  numerical   0
     * end_id      No        The ID of the transaction to finish displaying with numerical   ∞
     * order       No        sorting                                             ASC or DESC DESC
     * since       No        When to start displaying?                           UNIX time   0
     * end         No        When to finish displaying?                          UNIX time   ∞
     */
    self.transHistory = function (parameters, callback) {
        api.transHistory(parameters, callback);
    };

    //returns the trade history
    /*
     * Parameters:
     * parameter  required? description                                             type        example value
     * from       No        the number of the transaction to start displaying with  numerical   0
     * count      No        the number of transactions for displaying               numerical   1000
     * from_id    No        the ID of the transaction to start displaying with      numerical   0
     * end_id     No        the ID of the transaction to finish displaying with     numerical   ∞
     * order      No        sorting                                                 ASC or DESC DESC
     * since      No        when to start the displaying                            UNIX time   0
     * end        No        when to finish the displaying                           UNIX time   ∞
     * pair       No        the pair to show the transactions                       pair        btc_usd
     */
    self.tradeHistory = function (parameters, callback) {
        api.tradeHistory(parameters, callback);
    };

    // returns a list of active/open orders
    // if no pair is spesified then shows all pairs
    /*
     * Parameters:
     * parameter  required? description                     type  example value
     * pair       No        the pair to display the orders  pair  btc_usd
     */
    self.activeOrders = function (pair, callback) {
        // watch out this API is Deprecated
        api.activeOrders(pair, callback);
    };

    // submit a trade
    /*
     *  parameter   required?   description                                 type            example value
     *  pair        Yes         pair                                        pair            -
     *  type        Yes         The transaction type                        buy or sell     -
     *  rate        Yes         The rate to buy/sell                        numerical       -
     *  amount      Yes         The amount which is necessary to buy/sell   numerical       -
     */
    self.trade = function (pair, type, rate, amount, callback) {
        api.trade(pair, type, rate, amount, callback);
    };

    //
    /*
     *  parameter   required?   description     type        example value
     *  order_id    Yes         Order id        numerical   -
     */
    self.cancelOrder = function (orderId, callback) {
        api.cancelOrder(orderId, callback);
    };
    /*

    btce.cancelOrder(orderId, callback)

    Calls the CancelOrder method of the API.
    */
}

module.exports = {
    "public" : publicAPI,
    "private" : privateAPI,
    "pairs" : pairs
}