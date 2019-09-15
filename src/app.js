import _ from 'lodash';
import chalk from 'chalk';
import exchange from './exchange';
import generatePineScript from './generate'
import { exchangePruningPreferences, exchangePruningWithDifferencePreferences, excludedCryptoQuoteAssets, excludedFiatQuoteAssets, excludedCryptoPairedBaseAssets, excludedFiatPairedBaseAssets } from '../index';

// Exchange API urls
const binanceAPIUrl = 'https://api.binance.com/api/v1/exchangeInfo';
const bitfinexAPIUrl = 'https://api-pub.bitfinex.com/v2/tickers?symbols=ALL';
const bitstampAPIUrl = 'https://www.bitstamp.net/api/v2/trading-pairs-info/';
const bittrexAPIUrl = 'https://api.bittrex.com/api/v1.1/public/getmarkets';
const coinbaseAPIUrl = 'https://api.pro.coinbase.com/products';
const geminiAPIUrl = 'https://api.gemini.com/v1/symbols';
const krakenAPIUrl = 'https://api.kraken.com/0/public/AssetPairs';
const poloniexAPIUrl = 'https://poloniex.com/public?command=returnTicker';

/* APP HELPER FUNCTIONS */

/**
 * Function prunes and returns the pairs of an exchange by the following means:
 * If a pair does not consist of an excluded crypto or fiat quote asset, it gets removed;
 * If a pair consists of an excluded crypto quote asset, it gets removed only if pruneCryptoQuotePairs is true and the base asset is not excluded from pruning
 * If a pair consists of an excluded fiat quote asset, it gets removed only if pruneFiatQuotePairs is true and the base asset is not excluded from pruning
 *
 * @param {object} pairs - Contains all pairs of an exchange
 * @param {object} pruningPreferences - Contains the pruning preferences for pairs when they contain either a fiat or crypto quote asset
 * @returns {object} - Returns the pruned pairs
 *
 * @example - prunePairsByAssets ({ADA: {BTC: 'BINANCE:ADABTC', ...}, ...}, {pruneFiatQuotePairs: true, pruneCryptoQuotePairs: false})
 */
let prunePairsByAssets = (pairs, pruningPreferences) => {
  let prunedPairs = pairs;
  let pruneFiatPairs = pruningPreferences.pruneFiatQuotePairs;
  let pruneCryptoPairs = pruningPreferences.pruneCryptoQuotePairs;
  for (let baseAsset in pairs){
    let currentObject = pairs[baseAsset];
    for (let quoteAsset in currentObject){
      if (!excludedCryptoQuoteAssets.includes(quoteAsset) && !excludedFiatQuoteAssets.includes(quoteAsset)){
        delete currentObject[quoteAsset];
      }
      else{
        if(excludedCryptoQuoteAssets.includes(quoteAsset)){
          if (pruneCryptoPairs && !excludedCryptoPairedBaseAssets.includes(baseAsset)) delete currentObject[quoteAsset];
        }
        else{
          if (pruneFiatPairs && !excludedFiatPairedBaseAssets.includes(baseAsset)) delete currentObject[quoteAsset];
        }
      }
    }
    if (_.isEmpty(currentObject)) delete pairs[baseAsset];
  }
  return pairs;
}

/**
 * Function prunes all non-unique and non-excluded pairs of an exchange compared to pairs of another exchange
 * It does this by looping over the exchangePruningWithDifference JSON object (e.g. 'binance': ['bittrex', 'bitfinex']) in which:
 * The key contains the exchange name used for the comparison;
 * The value contains an array of all exchanges where pairs are to be pruned.
 *
 * @param {object} allPairs - Contains the pairs of all exchanges
 *
 * @example - prunePairsByExchangeDifference ('binance': {ADA: {BTC: 'BINANCE:ADABTC', ...}, ...})
 */
let prunePairsByExchangeDifference = (allPairs) => {
  for (let baseExchange in exchangePruningWithDifferencePreferences) {
    exchangePruningWithDifferencePreferences[baseExchange].forEach(prunedExchange => {
      for (let baseAsset in allPairs[baseExchange]){
        if (!excludedCryptoPairedBaseAssets.includes(baseAsset)){
          let prunedExchangePairs = allPairs[prunedExchange];
          delete prunedExchangePairs[baseAsset];
        }
      }
    });
  }
}

/* APP EXPORTS */

/**
 * Default exported main function which for each exchange:
 * Synchronously awaits the exchange promise to be resolved;
 * If resolved, prunes the received pairs using the prunePairsByAssets functions and adds the pairs the allPairs JSON object.
 *
 * The function then:
 * Calls the prunePairsByExchangeDifference for further pairs pruning;
 * Generates the pinescript with the remaining pairs by calling the generatePineScript function.
 */
let app = async () => {
  console.log(chalk.bold.inverse('Crypto Multi Exchange Volume 0.1.0'));
  let allPairs = {};
  allPairs['binance'] = await exchange('binance', binanceAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.binance)});
  allPairs['bitfinex'] = await exchange('bitfinex', bitfinexAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.bitfinex)});
  allPairs['bitstamp'] = await exchange('bitstamp', bitstampAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.bitstamp)});
  allPairs['bittrex'] = await exchange('bittrex', bittrexAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.bittrex)});
  allPairs['coinbase'] = await exchange('coinbase', coinbaseAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.coinbase)});
  allPairs['gemini'] = await exchange('gemini', geminiAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.gemini)});
  allPairs['kraken'] = await exchange('kraken', krakenAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.kraken)});
  allPairs['poloniex'] = await exchange('poloniex', poloniexAPIUrl).then(response => {return prunePairsByAssets(response, exchangePruningPreferences.poloniex)});
  prunePairsByExchangeDifference(allPairs);
  generatePineScript(allPairs);
}

export default app;
