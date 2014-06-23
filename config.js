

module.exports = {

    serverIp: process.env.HOST || '0.0.0.0',
    serverPort: process.env.PORT || 3000,

    dbName: process.env.DB_NAME || 'rybot',
    dbHost: process.env.DB_HOST || '127.0.0.1',
    dbPort: process.env.DB_PORT || 27017,

    logDays: 30,

    dataDays: 30,

    cookieSecret: "rybotcookiecat",
    cookieMaxAge: 1000 * 60 * 60 * 5, // 5 hours
        

    simMode: true,

    traderTradesSleep: 30
};