
// btc_usd, btc_rur, btc_eur, ltc_btc, ltc_usd, ltc_rur, ltc_eur, nmc_btc, nmc_usd, nvc_btc, 
// nvc_usd, usd_rur, eur_usd, trc_btc, ppc_btc, ftc_btc

module.exports = {
dbName: 'btcebot',
dbHost: '127.0.0.1',
dbPort: 27017,

pairs: ['btc_usd', 'ltc_usd', 'ltc_btc'],

simMode: true,

traderTradesSleep: 30
}