# Crypto Multi Exchange Volume (CMEV)

Crypto Multi Exchange Volume (CMEV) is a Tradingview-compatible indicator which aggregates and plots trading volumes for supported cryptoasset pairs over multiple different cryptoasset exchanges. For developers looking for more information and for those who want to compile their own version of CMEV, please refer to the [docs](./DOCS.md).

![CMEV cover photo](/resources/CMEV-cover.png)

## Setup

For OOTB use, copy the contents found in **crypto-mutli-exchange-volume.pine** into the Pine Editor on Tradingview and click "Add to Chart".

## Configuration

CMEV comes with two configurable settings - whether base volume or quote volume is plotted and the length of the volume's EMA. By default, the base volume is used for plotting and the length of the EMA is set to 12 periods.

## Use cases

The indicator was primarily developed in order to be able to chart using the trading pair with the longest available trading history. Due to the fast-changing preferences of where cryptoassets are traded, volumes tend to be very inconsistent and can give a distorted picture of a pairs history. For illustration, check out the SC-BTC pair from Poloniex using their native volume (in grey) compared to the CMEV volume (in white).

![SC-BTC chart on Poloniex](/resources/SCBTC-volume-reference.png)

The other use case is to be able to spot divergences in volume. A great example here is bitcoin's 2019 rally where volumes from derivatives exchanges (in grey) are at all time highs but volumes from retail/spot exchanges (CMEV, in white) are not.   

![XBT-USD chart on Bitmex](/resources/BTCUSD-volume-reference.png)

## Supported exchanges

CMEV currently supports asset pairs from the following exchanges:
* Binance
* Bitfinex
* Bitstamp
* Bittrex
* Coinbase
* Gemini
* Kraken
* Poloniex

## Limitations

Because of the fact that CMEV is pulling data from from multiple different exchanges and is computationally intensive it can take a couple of seconds to load while charting certain cryptoasset pairs.

Additionally, due to Tradingview's various limitations only a certain number of pairs can be supported at a time. By default, only pairs with a BTC or USD quote are supported and many non-unique pairs with consistently low trading volumes have been removed. For a full explanation, please refer to the [docs](./DOCS.md).

## Future of the project

I plan on supporting pairs from more exchanges in the future as I see fit and as they become available for charting on Tradingview. Further, I may develop a strategy script using CMEV as its core indicator.

I welcome everybody from the community to help me extend the functionality of CMEV in order to make investing in cryptoassets more transparent for everybody.
