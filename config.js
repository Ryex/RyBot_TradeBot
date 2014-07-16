

module.exports = {

    serverIp: process.env.IP || process.env.HOST || '0.0.0.0',  // server host
    serverPort: process.env.PORT || 3000,                       // server http port
    serverHTTPSPort: 442,                                       // server https port

    runHTTPS: false,  // run an HTTPS server?
    HTTPSOnly: false, // run ONLY the https server? above needs to be true for it to take effect

    dbName: process.env.DB_NAME || 'rybot', // name of database where data is to be stored
    dbAuthName: process.env.DB_AUTH_NAME || "rybot", // name of the database where the authenticating db user is (might not be the same ie. openshift)
    dbHost: process.env.DB_HOST || '127.0.0.1', // database host name or IP
    dbPort: process.env.DB_PORT || 27017, // database port
    dbUser: process.env.DB_USER || "", // name of authenticating db user, if left blank no authentication with the database is done.
    dbPass: process.env.DB_PASS || "", // db user password

    dataDays: 30, // after how many days should the database let data (trades and candle data) expire

    cookieSecret: "rybotcookiecat",   // CHANGE ME TO AN RANDOM STRING!
    cookieMaxAge: 1000 * 60 * 60 * 5, // 5 hours

    traderTradesSleep: 30,   // time in seconds between data scraping
    
    verboseErrors: true,  // print full stack message on server error pages?(this is a debug setting you probably want it set to false)
    
    themes: [        // add names of bootstrap themes here to enable thir selection in the settings menu
        'flatly',
        'darkly',
        'cyborg',
        'cosmo',
        'slate'
    ]
};