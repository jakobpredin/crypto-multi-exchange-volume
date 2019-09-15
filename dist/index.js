"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tickerVariations = exports.excludedFiatPairedBaseAssets = exports.excludedCryptoPairedBaseAssets = exports.excludedFiatQuoteAssets = exports.excludedCryptoQuoteAssets = exports.exchangePruningWithDifferencePreferences = exports.exchangePruningPreferences = exports.fileName = void 0;

var _app = _interopRequireDefault(require("./src/app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* INDEX EXPORTS */
// Output Pine filename
const fileName = 'crypto-multi-exchange-volume.pine';
/**
* Object containing pruning preferences for each exchange
* pruneFiatQuotePairs: if true, all pairs with a non-excluded fiat quote asset are pruned
* pruneCryptoQuotePairs: if true, all pairs with a non-excluded crypto quote asset are pruned
*/

exports.fileName = fileName;
const exchangePruningPreferences = {
  binance: {
    pruneFiatQuotePairs: true,
    pruneCryptoQuotePairs: false
  },
  bitfinex: {
    pruneFiatQuotePairs: true,
    pruneCryptoQuotePairs: true
  },
  bitstamp: {
    pruneFiatQuotePairs: false,
    pruneCryptoQuotePairs: false
  },
  bittrex: {
    pruneFiatQuotePairs: true,
    pruneCryptoQuotePairs: false
  },
  coinbase: {
    pruneFiatQuotePairs: true,
    pruneCryptoQuotePairs: false
  },
  gemini: {
    pruneFiatQuotePairs: false,
    pruneCryptoQuotePairs: false
  },
  kraken: {
    pruneFiatQuotePairs: false,
    pruneCryptoQuotePairs: false
  },
  poloniex: {
    pruneFiatQuotePairs: true,
    pruneCryptoQuotePairs: false
  }
};
/**
* Object containing prunning with difference preferences between pairs of exchanges
* Key: Exchanges whose base assets are used for the difference comparison
* Value: Arrays containing exchanges whose pairs with a non-excluded and comparatevely non-unique base asset are pruned
*/

exports.exchangePruningPreferences = exchangePruningPreferences;
const exchangePruningWithDifferencePreferences = {
  'binance': ['bittrex', 'bitfinex'],
  'bittrex': ['bitfinex'],
  'poloniex': ['bitfinex']
}; // Pairs containing the following crypto quote assets will be excluded from the initial pruning (include ticker variations)

exports.exchangePruningWithDifferencePreferences = exchangePruningWithDifferencePreferences;
const excludedCryptoQuoteAssets = ['BTC', 'XBT']; // Pairs containing the following fiat quote assets will be excluded from the initial pruning

exports.excludedCryptoQuoteAssets = excludedCryptoQuoteAssets;
const excludedFiatQuoteAssets = ['USD']; // Base assets which when paired with a crypto quote asset exempts the pair from pruning

exports.excludedFiatQuoteAssets = excludedFiatQuoteAssets;
const excludedCryptoPairedBaseAssets = ['ADA', 'ARK', 'ATOM', 'BCH', 'BLT', 'BNT', 'BSV', 'BTC', 'CVC', 'DAD', 'DASH', 'DCR', 'DGB', 'DNT', 'EOS', 'GAS', 'GNO', 'GNT', 'GRIN', 'LTC', 'MKR', 'MTL', 'NEO', 'QTUM', 'REN', 'REP', 'SC', 'SNM', 'SNT', 'STORJ', 'STRAT', 'TRX', 'UKG', 'WAVES', 'XEM', 'XVG', 'ZRX']; // Base assets which when paired with a fiat quote asset exempts the pair from pruning

exports.excludedCryptoPairedBaseAssets = excludedCryptoPairedBaseAssets;
const excludedFiatPairedBaseAssets = ['BCH', 'BTC', 'ETH', 'LTC', 'XBT', 'XMR', 'XRP', 'ZEC']; // Assets with ticker naming variations (add each possible combination)

exports.excludedFiatPairedBaseAssets = excludedFiatPairedBaseAssets;
const tickerVariations = {
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
exports.tickerVariations = tickerVariations;
(0, _app.default)();