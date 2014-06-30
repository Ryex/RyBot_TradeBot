

module.exports = {

    serverIp: process.env.IP || process.env.HOST || '0.0.0.0',
    serverPort: process.env.PORT || 3000,
    serverHTTPSPort: 442,

    runHTTPS: false,
    HTTPSOnly: false,

    dbName: process.env.DB_NAME || 'rybot', // name of database where data is to be stored
    dbAuthName: process.env.DB_AUTH_NAME || "rybot", // name of the database where the authenticating db user is (might not be the same ie. openshift)
    dbHost: process.env.DB_HOST || '127.0.0.1', // database host name or IP
    dbPort: process.env.DB_PORT || 27017, // database port
    dbUser: process.env.DB_USER || "", // name of authenticating db user, if left blank no authentication with the database is done.
    dbPass: process.env.DB_PASS || "", // db user password

    logDays: 30,

    dataDays: 30,

    cookieSecret: "rybotcookiecat",
    cookieMaxAge: 1000 * 60 * 60 * 5, // 5 hours


    simMode: true,

    traderTradesSleep: 30
};