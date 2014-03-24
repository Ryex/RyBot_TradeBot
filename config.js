
// btc_usd, btc_rur, btc_eur, ltc_btc, ltc_usd, ltc_rur, ltc_eur, nmc_btc, nmc_usd, nvc_btc, 
// nvc_usd, usd_rur, eur_usd, trc_btc, ppc_btc, ftc_btc

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

pairs: ['btc_usd', 'ltc_usd', 'ltc_btc'],

simMode: true,

traderTradesSleep: 30
}