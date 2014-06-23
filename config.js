

module.exports = {

    serverIp: '0.0.0.0',
    serverPort: process.env.PORT || 3000,

    dbName: 'btcebot',
    dbHost: '127.0.0.1',
    dbPort: 27017,

    logDays: 30,

    dataDays: 30,

    cookieSecret: "rybotcookiecat",
    cookieMaxAge: 1000 * 60 * 60 * 5, // 5 hours
        

    simMode: true,

    traderTradesSleep: 30
};