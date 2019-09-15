import fetch from 'node-fetch';
import chalk from 'chalk';
import _ from 'lodash';

/* EXCHANGE HELPER FUNCTIONS */

/**
 * Creates a Pine Script compatible tickerid using the exchange, baseAsset and quoteAsset parameters and adds it to the pairs object
 *
 * @param {string} exchange - Contains the exchange name (as used in Tradingview) with an added colon at the end
 * @param {object} pairs - Contains the pairs object containing all of the already created exchange pairs and their respective Pine Script compatible tickerid
 * @param {object} baseAsset - Contains the ticker base asset
 * @param {object} quoteAsset - Contains the ticker quote asset
 *
 * @example
 *
 *  createTickerName('BINANCE:', {}, 'ETH', 'BTC')
 */
let createTickerName = (exchange, pairs, baseAsset, quoteAsset) => {
  let baseObject = {};
  let tradingviewPair = exchange + baseAsset + quoteAsset;
  if(baseAsset in pairs){
    let baseObject = pairs[baseAsset];
    baseObject[quoteAsset] = tradingviewPair;
  }
  else{
    baseObject[quoteAsset] = tradingviewPair;
    pairs[baseAsset] = baseObject;
  }
}

// Sorts the json by key
let sortPairsByKey = (json) => {
  let sortedpairs = {};
  Object.keys(json).sort().forEach( key => { sortedpairs[key] = json[key]; });
  return sortedpairs;
};

/* EXCHANGE RESPONSE PARSERS */

// Compatible with Binance API v1
let parseBinance = (json) => {
  let pairs = {};
  json.symbols.map( pair => {
    if (pair.status != 'HALT' &&  pair.status != 'BREAK' && pair.isSpotTradingAllowed){
      let baseAsset = pair.baseAsset;
      let quoteAsset = pair.quoteAsset;
      createTickerName('BINANCE:', pairs, baseAsset, quoteAsset);
    }
  });
  return pairs;
}

// Compatible with Bitfinex API v2
let parseBitfinex = (json) => {
  let pairs = {};
  json.forEach( pair => {
    let baseAsset = pair[0].substr(1, 3);
    let quoteAsset = pair[0].substr(4, 6);
    createTickerName('BITFINEX:', pairs, baseAsset, quoteAsset);
  });
  return pairs;
}

// Compatible with Bitstamp API v1
let parseBitstamp = (json) => {
  let pairs = {};
  json.forEach(pair => {
    let splitPair = _.split(pair.name, '/', 2);
    let baseAsset = splitPair[0];
    let quoteAsset = splitPair[1];
    createTickerName('BITSTAMP:', pairs, baseAsset, quoteAsset);
  });
  return pairs;
}

// Compatible with Binance API v1.1
let parseBittrex = (json) => {
  let pairs = {};
  json.result.map( pair => {
    if (pair.IsActive == true && pair.Notice == null){
      let baseAsset = pair.MarketCurrency;
      let quoteAsset = pair.BaseCurrency;
      createTickerName('BITTREX:', pairs, baseAsset, quoteAsset);
    }
  });
  return pairs;
}

// Compatible with Coinbase API v2
let parseCoinbase = (json) => {
  let pairs = {};
  json.forEach(pair => {
    let baseAsset = pair.base_currency;
    let quoteAsset = pair.quote_currency;
    createTickerName('COINBASE:', pairs, baseAsset, quoteAsset);
  });
  return pairs;
}

// Compatible with Gemini API v1
let parseGemini = (json) => {
  let pairs = {};
  json.forEach(pair => {
    let baseAsset = pair.substr(0, 3).toUpperCase();
    let quoteAsset = pair.substr(3, 5).toUpperCase();
    createTickerName('GEMINI:', pairs, baseAsset, quoteAsset);
  });
  return pairs;
}

// Compatible with Kraken API v1
let parseKraken = (json) => {
  let results = json.result;
  let pairs = {};
  for (let baseObject in results){
    let splitPair = _.split(results[baseObject].wsname, '/', 2);
    let baseAsset = splitPair[0];
    let quoteAsset = splitPair[1];
    if(baseAsset != ''){
      createTickerName('KRAKEN:', pairs, baseAsset, quoteAsset);
    }
  }
  return pairs;
}

// Compatible with Poloniex API v1
let parsePoloniex = (json) => {
  let pairs = {};
  for (let pair in json){
    let splitPair = _.split(pair, '_', 2);
    let baseAsset = splitPair[1];
    let quoteAsset = splitPair[0];
    createTickerName('POLONIEX:', pairs, baseAsset, quoteAsset);
  }
  return pairs;
}

// Given the string exchangeName, the functions calls the appropriate exchange parser function and passing the json response
let parseResponse = (json, exchangeName) => {
  let pairs = {};
  switch (exchangeName) {
    case 'binance': pairs = parseBinance(json); break;
    case 'bitfinex': pairs = parseBitfinex(json); break;
    case 'bitstamp': pairs = parseBitstamp(json); break;
    case 'bittrex': pairs = parseBittrex(json); break;
    case 'coinbase': pairs = parseCoinbase(json); break;
    case 'gemini': pairs = parseGemini(json); break;
    case 'kraken': pairs = parseKraken(json); break;
    case 'poloniex': pairs = parsePoloniex(json); break;
    default: break;
  }
  return pairs;
};

/* EXCHANGE EXPORTS */

/**
 * Default exported function which when called returns a promise where:
 * A fetch GET API call gets executed with exchangeAPIUrl as its parameter in order to receive exchange pairs;
 * If the response is received sucessfully, the response JSON object gets parsed, sorted and is passed as a parameter while resolving the promise;
 * If the response is not received sucessfully, the promise gets rejected with the given response status.
 *
 * @param {string} exchangeName - Name of the exchange
 * @param {string} exchangeAPIUrl - GET API endpoint of the exchange which gets all asset pairs
 *
 * @example - exchange('binance', 'https://api.binance.com/api/v1/exchangeInfo')
 */
let exchange = (exchangeName, exchangeAPIUrl) => {
  console.log(chalk.white('Fetching ' + _.capitalize(exchangeName) + ' pairs...'));
  return new Promise(resolve => {
    fetch(exchangeAPIUrl)
      .then( response => response.ok ? response.json() : Promise.reject(_.capitalize(exchangeName) + ' GET API call failed with status ' + response.status) )
      .then( json => {
          console.log(chalk.white('Parsing response and sorting ' + _.capitalize(exchangeName) + ' pairs...'));
          let pairs = parseResponse(json, exchangeName);
          pairs = sortPairsByKey(pairs);
          resolve(pairs);
      })
      .catch( error => console.log(chalk.red(error)) );
  });
};

export default exchange;
