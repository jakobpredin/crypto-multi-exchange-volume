import app from './src/app'

/* INDEX EXPORTS */

// Output Pine filename
export const fileName = 'crypto-multi-exchange-volume.pine';

/**
* Object containing pruning preferences for each exchange
* pruneFiatQuotePairs: if true, all pairs with a non-excluded fiat quote asset are pruned
* pruneCryptoQuotePairs: if true, all pairs with a non-excluded crypto quote asset are pruned
*/
export const exchangePruningPreferences = {
  binance: {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: false},
  bitfinex: {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: true},
  bitstamp: {pruneFiatQuotePairs: false, pruneCryptoQuotePairs: false},
  bittrex: {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: false},
  coinbase: {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: false},
  gemini: {pruneFiatQuotePairs: false, pruneCryptoQuotePairs: false},
  kraken: {pruneFiatQuotePairs: false, pruneCryptoQuotePairs: false},
  poloniex: {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: false}
}

/**
* Object containing prunning with difference preferences between pairs of exchanges
* Key: Exchanges whose base assets are used for the difference comparison
* Value: Arrays containing exchanges whose pairs with a non-excluded and comparatevely non-unique base asset are pruned
*/
export const exchangePruningWithDifferencePreferences = {
  'binance': ['bittrex', 'bitfinex'],
  'bittrex': ['bitfinex'],
  'poloniex': ['bitfinex']
}

// Pairs containing the following crypto quote assets will be excluded from the initial pruning (include ticker variations)
export const excludedCryptoQuoteAssets = ['BTC', 'XBT'];

// Pairs containing the following fiat quote assets will be excluded from the initial pruning
export const excludedFiatQuoteAssets = ['USD'];

// Base assets which when paired with a crypto quote asset exempts the pair from pruning
export const excludedCryptoPairedBaseAssets = [
  'ADA', 'ARK', 'ATOM', 'BCH', 'BLT', 'BNT', 'BSV', 'BTC', 'CVC', 'DAD', 'DASH', 'DCR', 'DGB',
  'DNT', 'EOS', 'GAS', 'GNO', 'GNT', 'GRIN', 'LTC', 'MKR', 'MTL', 'NEO', 'QTUM', 'REN', 'REP', 'SC',
  'SNM', 'SNT', 'STORJ', 'STRAT', 'TRX', 'UKG', 'WAVES', 'XEM', 'XVG', 'ZRX'
];

// Base assets which when paired with a fiat quote asset exempts the pair from pruning
export const excludedFiatPairedBaseAssets = ['BCH', 'BTC', 'ETH', 'LTC', 'XBT', 'XMR', 'XRP', 'ZEC'];

// Assets with ticker naming variations (add each possible combination)
export const tickerVariations = {
  'BCH': 'BCHABC',
  'BCHABC': 'BCH',
  'BSV': 'BCHSV',
  'BCHSV': 'BSV',
  'DAD': 'DADI',
  'DADI': 'DAD',
  'DOGE': 'XDG',
  'STR': 'XLM',
  'XDG': 'DOGE',
  'XLM': 'STR'
};

app();
