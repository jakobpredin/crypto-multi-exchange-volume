import _ from 'lodash';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import { fileName, tickerVariations } from '../index';

let baseAssetsWithXBTPairs = []; // Array placeholder which will contain all baseAssets with an XBT pair (BTC naming variation)
let scopeCounter = 0; // Integer contains the number of local scopes in the generated pinescript (Tradingview imposes a 500 local scopes limit)

/* GENERATE HELPER FUNCTIONS */

// Adds all base assets from pairs containing an XBT quote asset to the baseAssetsWithXBTPairs array
let findBaseAssetsWithXBTPairs = (pairs) => {
  for (let currentExchange in pairs){
    let currentObject = pairs[currentExchange];
    for (let baseAsset in pairs[currentExchange]){
      for (let quoteAsset in currentObject[baseAsset]){
        if(quoteAsset == 'XBT') baseAssetsWithXBTPairs.push(baseAsset);
      }
    }
  }
}

// Append string to file, log if error
let appendStringToFile = (string) => {
  fs.appendFileSync(fileName, string, error => console.log(error));
}

// Append a new line to file zero or more times, log if error
let appendNewLineToFile = (repetitions) => {
  for (let i=0; i<=repetitions; i++){
    fs.appendFileSync(fileName, os.EOL, error => console.log(error));
  }
}

/**
 * Function creates and returns a string given all the possible base asset and quote asset naming variations.
 * The returned string can either be empty or can contain a partial Pine Script terniary if with one to three pinescript OR statements.
 *
 * @param {string} baseAsset - Contains the baseAsset symbol - e.g. ETH, LTC, XRP
 * @param {string} quoteAsset - Contains the quoteAsset symbol - e.g. BTC, XBT, USD
 * @returns {string} - Returns variationString containing all possible naming combinations
 *
 * @example
 *  getAssetNameVariations ('ADX', 'BTC') -> ''
 *  getAssetNameVariations ('ADA', 'BTC') -> 'or syminfo.ticker == "ADAXBT"'
 *  getAssetNameVariations ('ADA', 'XBT') -> 'or syminfo.ticker == "ADABTC"'
 *  getAssetNameVariations ('BTC', 'USD') -> 'or syminfo.ticker == "BTCXBT"'
 *  getAssetNameVariations ('STR', 'BTC') -> 'or syminfo.ticker == "STRXBT" or syminfo.ticker == "XLMBTC" or syminfo.ticker == "XLMXBT"'
 *  getAssetNameVariations ('XLM', 'XBT') -> 'or syminfo.ticker == "STRBTC" or syminfo.ticker == "XLMXBT" or syminfo.ticker == "XLMBTC"'
 *  getAssetNameVariations ('XLM', 'USD') -> 'or syminfo.ticker == "STRUSD"'
 */
let getAssetNameVariations = (baseAsset, quoteAsset) => {
  let variationString = '';
  // Special case if bitcoin (BTC, XBT) is the baseAsset
  if(baseAsset == 'BTC' || baseAsset == 'XBT'){
    let baseAssetVariation = baseAsset == 'BTC' ? 'XBT' : 'BTC';
    variationString += ' or syminfo.ticker == "' + baseAssetVariation + quoteAsset + '"';
  }
  else{
    let baseAssetVariation = baseAsset in tickerVariations ? tickerVariations[baseAsset] : '';
    let quoteAssetVariation = quoteAsset == 'BTC' ? 'XBT' : 'BTC';
    let hasXBTPair = baseAssetsWithXBTPairs.includes(baseAsset) || baseAssetsWithXBTPairs.includes(baseAssetVariation);
    // Include if the baseAsset has an XBT quoteAsset pair
    if ((quoteAsset == 'BTC' || quoteAsset == 'XBT') && hasXBTPair){
      variationString += ' or syminfo.ticker == "' + baseAsset + quoteAssetVariation + '"'; // (XLM, BTC) -> (XLM, XBT)
    }
    // Include if the baseAsset has a name variation
    if (baseAssetVariation != ''){
      variationString += ' or syminfo.ticker == "' + baseAssetVariation + quoteAsset + '"'; // (XLM, BTC) -> (STR, BTC)
      if ((quoteAsset == 'BTC' || quoteAsset == 'XBT') && hasXBTPair){
        variationString += ' or syminfo.ticker == "' + baseAssetVariation + quoteAssetVariation + '"'; // (XLM, BTC) -> (STR, XBT)
      }
    }
  }
  return variationString;
}

/**
 * Function constructs the terniary if for determining an exchange's tickerid.
 * It returns a string containing all ticker comparisons and the appropriate tickerid for pairs of an exchange.
 * Uses the tickerid GOLD for concluding the terniary which is used if the current ticker has no match.
 *
 * @param {object} currentPairs - Contains all pairs of an exchange
 * @returns {strings} - Returns a string containing pinescript terniary if statements with all pairs
 *
 * @example - generateExchangeTickerIds({'BTC': {'USD': 'GEMINI:BTCUSD'}}) -> 'syminfo.ticker == "BTCUSD" or syminfo.ticker == "XBTUSD" ? "GEMINI:BTCUSD" : "GOLD"'
 */
let generateExchangeTickerIds = (currentPairs) => {
  let currentExchangeTicker = '';
  for (let baseAsset in currentPairs){
    let currentObject = currentPairs[baseAsset];
    for (let quoteAsset in currentObject){
      let exchangePair = currentObject[quoteAsset];
      let variationString = getAssetNameVariations(baseAsset, quoteAsset);
      currentExchangeTicker +=  'syminfo.ticker == "' + baseAsset + quoteAsset + '"' + variationString + ' ? "' + exchangePair +  '" : ';
      scopeCounter++;
    }
  }
  currentExchangeTicker += '"GOLD"';
  return currentExchangeTicker;
}

/**
 * Function generates and appends the following lines for each exchange:
 * The variable containing the exchange's tickerid given the current ticker;
 * The variable containing the volume of the current exchanges corresponding to the current ticker (zero if not found);
 * The variable containing the sum of volumes from all exchanges.
 *
 * @param {object} pairs - Contains the pairs of all exchanges
 *
 * @example - generateExchangeTickerIds(binance: {'ADA': {...}, ...}, ...)
 */
let appendExchangeTickers = (pairs) => {
  let baseVolume = 'baseVolume = ';
  let counter = 0;
  let numOfExchanges = Object.keys(pairs).length;
  let exchangeVolumeVariables = [];
  for (let currentExchange in pairs){ // e.g. 'binance': {'ADA': {...}, ...}
    let currentExchangeTicker = currentExchange + 'Ticker = ' + generateExchangeTickerIds(pairs[currentExchange]);
    exchangeVolumeVariables.push(currentExchange + 'Volume = ' + currentExchange + 'Ticker != "GOLD" ? nz(security(' + currentExchange + 'Ticker, timeframe.period, volume)) : 0');
    appendStringToFile(currentExchangeTicker);
    appendNewLineToFile(1);
    counter++;
    baseVolume += currentExchange + 'Volume';
    if (counter < numOfExchanges) baseVolume += ' + ';
  }
  exchangeVolumeVariables.forEach(value => {
    appendStringToFile(value);
    appendNewLineToFile(0);
  });
  appendNewLineToFile(0);
  appendStringToFile(baseVolume);
  appendNewLineToFile(0);
}

/* GENERATE EXPORTS */

/**
 * Default exported function which generates the pinescript by:
 * Creating or truncating a new file with the name fileName;
 * Appending the top part of the pinescript (skeleton) to the file;
 * Appending the variable part of the pinescript to the file by calling the appendExchangeTickers function;
 * Appending the bottom part of the pinescript (skeleton) to the file.
 *
 * The function will log an error if the generated pinescript contains more than 500 local scopes (it will not compile on Tradingview).
 *
 * @param {object} pairs - Contains the pairs of all exchanges
 *
 * @example - generatePineScript(binance: {'ADA': {...}, ...}, ...)
 */
let generatePineScript = (pairs) => {
  console.log(chalk.white("Generating the Pinescript file..."));
  let pinescriptSkeletonTop = fs.readFileSync('./src/skeleton/pinescript-skeleton-top.txt', { encoding: 'utf-8', flag: 'r' });
  let pinescriptSkeletonBottom = fs.readFileSync('./src/skeleton/pinescript-skeleton-bottom.txt', { encoding: 'utf-8', flag: 'r' });
  findBaseAssetsWithXBTPairs(pairs);
  fs.closeSync(fs.openSync(fileName, 'w')); // Creates a write-only file if it doesn't exist, truncates the contents otherwise
  appendStringToFile(pinescriptSkeletonTop);
  appendExchangeTickers(pairs);
  appendStringToFile(pinescriptSkeletonBottom);
  if (scopeCounter + 2 > 500){
    console.log(chalk.red('WARNING: The script has ' + (scopeCounter + 2) + ' local scopes and will not compile successfully. Tradingview imposes a 500 local scopes limit per script. Try reducing the number of asset pairs.'));
  }
  console.log(chalk.green("Compiled successfully!"))
};

export default generatePineScript;
