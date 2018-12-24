const binance = require("../node-binance-api.js");
let Depth = require("../../../proxy").Depth;
let cache = require("../../../common/cache");
var token = require("../../../token");

binance.options({
  APIKEY: '',//token.keys["binance"].apiKey,
  APISECRET: '',//token.keys["binance"].secret
});

// Get bid/ask prices
//binance.allBookTickers(function(error, json) {
//  console.log("allBookTickers",json);
//});

// Getting latest price of a symbol
// binance.prices(function(error, ticker) {
// 	console.log("prices()", ticker);
// 	console.log("Price of BNB: ", ticker.BNBBTC);
// });

//Getting list of current balances
let coins = ["EOS", "ETH", "BCC", "BTC", "BTG", "USDT", "BNB"]; //, 'ETH/BTC'
// { free: 2.88768343,
//   used: 0.10515742999999977,
//   total: 2.99284086 }
/*binance.balance(function(error, balances) {
  console.log("balances()", balances);
  let b = {};
  for (let index in coins) {
    let item = {};
    let coin = coins[index];
    console.log(coins[index], balances[coin], typeof coin);
    item.free = +balances[coin].available;
    item.used = +balances[coin].onOrder;
    item.total = item.free + item.used;
    if (coin == "BCC") {
      console.log("coin bcc", coin);
      coin = "BCH";
    }

    b[coin] = item;
  }
  console.log("save b: ", b);
  cache.set("balancebinance", b, function() {
    //console.log('b.')
    // cache.get('bitfinexBCH/BTC', function (err, data) {
    //   console.log('data: ', data)
    // })
  });

  // if ( typeof balances.ETH !== "undefined" ) {
  // 	console.log("ETH balance: ", balances.ETH.available);
  // }
});
*/
// cache.get('balancebinance', function (err, data) {
//  console.log('data: ', data)
// })

// Getting bid/ask prices for a symbol
//binance.bookTickers(function(error, ticker) {
//	console.log("bookTickers()", ticker);
//	console.log("Price of BNB: ", ticker.BNBBTC);
//});

// Get market depth for a symbol
//binance.depth("SNMBTC", function(error, json) {
//	console.log("market depth",json);
//});

// Getting list of open orders
//binance.openOrders("ETHBTC", function(error, json) {
//	console.log("openOrders()",json);
//});

// Check an order's status
//let orderid = "7610385";
//binance.orderStatus("ETHBTC", orderid, function(error, json) {
//	console.log("orderStatus()",json);
//});

// Cancel an order
//binance.cancel("ETHBTC", orderid, function(error, response) {
//	console.log("cancel()",response);
//});

// Trade history
//binance.trades("SNMBTC", function(error, json) {
//  console.log("trade history",json);
//});

// Get all account orders; active, canceled, or filled.
//binance.allOrders("ETHBTC", function(error, json) {
//	console.log(json);
//});

//Placing a LIMIT order
//binance.buy(symbol, quantity, price);
//binance.buy("ETHBTC", 1, 0.0679);
//binance.sell("ETHBTC", 1, 0.069);

//Placing a MARKET order
//binance.buy(symbol, quantity, price, type);
//binance.buy("ETHBTC", 1, 0, "MARKET")
//binance.sell(symbol, quantity, 0, "MARKET");

// Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
// binance.candlesticks("BNBBTC", "5m", function(error, ticks) {
// 	console.log("candlesticks()", ticks);
// 	let last_tick = ticks[ticks.length - 1];
// 	let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
// 	console.log("BNBBTC last close: "+close);
// });

let symbols_map = {
  EOSBTC: "EOS/BTC",
  ETHBTC: "ETH/BTC",
  BCHABCBTC: "BCH/BTC",
  BCHSVBTC: "BSV/BTC",
  EOSETH: "EOS/ETH",
  EOSUSDT: "EOS/USDT",
  ETHUSDT: "ETH/USDT",
  BTCUSDT: "BTC/USDT",
  BNBBTC: "BNB/BTC"
};
// Maintain Market Depth Cache Locally via WebSocket

function isSameDepth(depth1, depth2) {
  try {
    if (depth1 == null || depth2 == null) return false;

    if (
      depth1["ask0"][0] != depth2["ask0"][0] ||
      depth1["ask0"][1] != depth2["ask0"][1] ||
      depth1["bid0"][0] != depth2["bid0"][0] ||
      depth1["bid0"][1] != depth2["bid0"][1]
    )
      return false;

    let time_diffrence = depth1.website_time - depth2.website_time;
    if (time_diffrence > 1000) {
      console.log("should return for time_diffrence:", time_diffrence);
      //return false
    }
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

let cache_sym_depth = {
  "EOS/BTC": null,
  "ETH/BTC": null,
  "BCH/BTC": null,
  "BSV/BTC": null,
  "EOS/ETH": null,
  "EOS/USDT": null,
  "ETH/USDT": null,
  "BTC/USDT": null,
  "BNB/BTC": null
};
binance.websockets.depthCache(
  [
    "EOSBTC", "ETHBTC", "BCHABCBTC", "BCHSVBTC", 
    /*"EOSETH",
    "BCCETH",
    "EOSUSDT",
    "ETHUSDT",
    "BCCUSDT",
    "BTCUSDT",
    "BNBBTC"*/
  ],
  function(symbol, depth) {
    let max = 10; // Show 10 closest orders only
    let bids = binance.sortBids(depth.bids, max);
    let asks = binance.sortAsks(depth.asks, max);
    console.log(symbols_map[symbol] + " depth cache update");
    //console.log("asks", asks);
    //console.log("bids", bids);
    console.log("ask: " + binance.first(asks), asks[binance.first(asks)]);
    console.log("bid: " + binance.first(bids), bids[binance.first(bids)]);
    let dep = {
      website_time: new Date(),
      exchange: "binance",
      symbol: symbols_map[symbol],
      ask0: [+binance.first(asks), asks[binance.first(asks)]],
      bid0: [+binance.first(bids), bids[binance.first(bids)]],
      asks: asks,
      bids: bids
    };
    if (!isSameDepth(cache_sym_depth[symbols_map[symbol]], dep)) {
      //Depth.NewDepth(dep)
      cache.set("binance" + symbols_map[symbol], dep, function() {
        //console.log('b.')
        // cache.get('bitfinexBCH/BTC', function (err, data) {
        //   console.log('data: ', data)
        // })
      });
      cache_sym_depth[symbols_map[symbol]] = dep;
    } else {
      console.log(symbols_map[symbol] + " same Depth error");
    }
  }
);
