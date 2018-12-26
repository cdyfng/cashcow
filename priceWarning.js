/**
 * Created by cdyfng on 27/09/17.
 */

//var token = require("./token");
//var play = require("play");
var logger = require("./common/logger");
var util = require("util");
const assert = require("assert");
var schedule = require("node-schedule");
var mail = require("./common/mail");
var config = require("./config");

var _ = require("lodash");
var async = require("async");
//var ccxt = require("./ccxt/ccxt");
var itertools = require("itertools");
var os = require("os");
var Order = require("./proxy").Order;

let cache = require("./common/cache");
let reminder_trade_wav = "./music/dididi.wav";
("use strict");
//let csv = require('ya-csv')
//let w = csv.createCsvFileWriter('./depths.csv')

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: "./depths.csv",
  header: [
    { id: "exchange", title: "exchange" },
    { id: "datetime", title: "datetime" },
    { id: "symbol", title: "symbol" },
    { id: "dog", title: "dog" },
    { id: "side", title: "side" },
    { id: "warning", title: "warning" },
    { id: "threshold0", title: "threshold0" },
    { id: "threshold1", title: "threshold1" },
    { id: "threshold2", title: "threshold2" },
    { id: "ask_price_0", title: "ask_price_0" },
    { id: "ask_amount_0", title: "ask_amount_0" },
    { id: "bid_price_0", title: "bid_price_0" },
    { id: "bid_amount_0", title: "bid_amount_0" },
    { id: "ask_price_1", title: "ask_price_1" },
    { id: "ask_amount_1", title: "ask_amount_1" },
    { id: "bid_price_1", title: "bid_price_1" },
    { id: "bid_amount_1", title: "bid_amount_1" },
    { id: "ask_price_2", title: "ask_price_2" },
    { id: "ask_amount_2", title: "ask_amount_2" },
    { id: "bid_price_2", title: "bid_price_2" },
    { id: "bid_amount_2", title: "bid_amount_2" },
    { id: "ask_price_3", title: "ask_price_3" },
    { id: "ask_amount_3", title: "ask_amount_3" },
    { id: "bid_price_3", title: "bid_price_3" },
    { id: "bid_amount_3", title: "bid_amount_3" },
    { id: "ask_price_4", title: "ask_price_4" },
    { id: "ask_amount_4", title: "ask_amount_4" },
    { id: "bid_price_4", title: "bid_price_4" },
    { id: "bid_amount_4", title: "bid_amount_4" }
    // {id: 'ask_price_5', title: 'ask_price_5'},
    // {id: 'ask_amount_5', title: 'ask_amount_5'},
    // {id: 'bid_price_5', title: 'bid_price_5'},
    // {id: 'bid_amount_5', title: 'bid_amount_5'},
    // {id: 'asks', title: 'asks'},
    // {id: 'bids', title: 'bids'},
  ],
  append: true
});

let mail_to = config.mail_to;

const log = require("ololog").configure({
  locate: false
});
require("ansicolor").nice;

let debug = true;
//false

//daily increse, for statistic utility
let statisticId = 189;
let setting = {
  "ETH/BTC": {
    hungry_dog: 0,
    smallThreshold: 1.0,
    threshold: 1.00051,
    bigThreshold: 1.00152,
    reminder_wav_path: "./music/aheahe.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 1,
    min_support_coin: 0.5, // 08, // 0.004,
    AUTO_ADJUST_GATE: 1.1, // 4, // 2,
    AUTO_ADJUST_SKIP: 20
  },
  "BCH/BTC": {
    hungry_dog: 0,
    smallThreshold: 1.0,
    threshold: 1.00051,
    bigThreshold: 1.00152,
    reminder_wav_path: "./music/dididi.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 0.5, // 5,
    min_support_coin: 0.3, // 0.4, // 04, // 4,
    AUTO_ADJUST_GATE: 0.51, // 2, // 1,
    AUTO_ADJUST_SKIP: 6
  },
  "BSV/BTC": {
    hungry_dog: 0,
    smallThreshold: 1.0,
    threshold: 1.00051,
    bigThreshold: 1.00152,
    reminder_wav_path: "./music/dididi.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 0.5, // 5,
    min_support_coin: 0.3, // 0.4, // 04, // 4,
    AUTO_ADJUST_GATE: 0.51, // 2, // 1,
    AUTO_ADJUST_SKIP: 6
  },
  "EOS/BTC": {
    hungry_dog: 0,
    smallThreshold: 1.0,
    threshold: 1.00051,
    bigThreshold: 1.00152,
    reminder_wav_path: "./music/snare.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 200,
    min_support_coin: 50, // 8, // 20, // 8,
    AUTO_ADJUST_GATE: 100.1, // 200,
    AUTO_ADJUST_SKIP: 1200
  },
  "BTG/BTC": {
    hungry_dog: 0,
    smallThreshold: 1.0002,
    threshold: 1.03,
    bigThreshold: 1.00303025,
    current_price: 0,
    reminder_wav_path: "./music/dididi.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 0.4, // 1,
    min_support_coin: 0.06,
    AUTO_ADJUST_GATE: 2,
    AUTO_ADJUST_SKIP: 10
  },
  "EOS/ETH": {
    hungry_dog: 0,
    smallThreshold: 1.0002,
    threshold: 1.006,
    bigThreshold: 1.00303025,
    current_price: 0,
    reminder_wav_path: "./music/dididi.wav",
    first_warn: false,
    processing: false,
    max_support_coin: 20,
    min_support_coin: 0.04,
    AUTO_ADJUST_GATE: 200, // no use
    AUTO_ADJUST_SKIP: 1000 // no use
  }
};

let feeRate = {
  bitfinex: { taker: -0.002, maker: -0.001 },
  okex: { taker: -0.002, maker: -0.0015 },
  hitbtc: { taker: -0.001, maker: 0.0001 },
  huobipro: { taker: -0.002, maker: -0.002 },
  binance: { taker: -0.0005, maker: -0.0005 }
};

//let notinclude = ['okex']
let all_ex = [/* 'hitbtc', "huobipro",*/  "okex", "binance", "bitfinex"];
let delays = [600, 600, 1000];

let symbols = ["EOS/BTC", "ETH/BTC", "BCH/BTC", "BSV/BTC" /*'EOS/ETH',  'BTG/BTC'*/];
//, 'ETH/BTC'
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let exchanges = {};

let getRate = async function(exchange, symbol) {
  try {
    await exchange.loadMarkets();

    if (symbol in exchange.markets) {
      let orderBook = await exchange.fetchOrderBook(symbol, {
        // 'size': 5
      });

      let result = {
        bid0: orderBook["bids"][0],
        ask0: orderBook["asks"][0],
        timestamp: Date.now(), // orderBook['timestamp'],
        datetime: orderBook["datetime"],
        extra_fee: 0
      };
      // log(exchange.id.blue, symbol.blue, 'orderBook', result)
      return result;
    } else {
      // do nothing or throw an error
      log.bright.yellow(exchange.id + " does not have " + symbol);
      return null;
    }
  } catch (e) {
    /*if (e instanceof ccxt.DDoSProtection) {
      log.bright.yellow(exchange.id, "[DDoS Protection]");
    } else if (e instanceof ccxt.RequestTimeout) {
      log.bright.yellow(exchange.id, "[Request Timeout]");
    } else if (e instanceof ccxt.AuthenticationError) {
      log.bright.yellow(exchange.id, "[Authentication Error]");
    } else if (e instanceof ccxt.ExchangeNotAvailable) {
      log.bright.yellow(exchange.id, "[Exchange Not Available]");
    } else if (e instanceof ccxt.ExchangeError) {
      log.bright.yellow(exchange.id, "[Exchange Error]");
    } else if (e instanceof ccxt.NetworkError) {
      log.bright.yellow(exchange.id, "[Network Error]");
    } else {
      throw e;
    }*/
    await sleep(10000);
    // throw e
  }
};

async function getLastDepth(exchange, symbol, interval = 10000) {
  try {
    let d = await cache.promiseGet(exchange + symbol);
    let now = new Date();
    // log.red(typeof d.website_time, typeof now)
    let time_diffrence = now - new Date(d.website_time);
    if (time_diffrence <= interval) {
      return d;
    } else {
      log.bright.red(
        exchange,
        symbol,
        " fetch time_diffrence: ",
        time_diffrence,
        now,
        d.website_time
      );
      return null;
    }
  } catch (e) {
    log.bright.red(exchange, "get Depth error");
    log.bright.red(e);
    return null;
  }
}

let processingCnt = 0;

//add buffer to analyse the order list
//size 100
//push data when ask0 or bid0 change
//save into a csv file when warnning triggers
let orderlist_buffer = [];
let depth_item = null;
let last_depth = {};
// init last_depth
_.forEach(all_ex, function(ex) {
  last_depth[ex] = {};
  _.forEach(symbols, function(symbol) {
    last_depth[ex][symbol] = { asks: null, bids: null };
  });
});

async function priceWarning() {
  let CONCURRENTCY_SIZE = 1;
  let i = 0;
  while (true) {
    try {
      let symbol = symbols[i % symbols.length];
      // 'BCH/BTC' //
      let zeros = symbol == "EOS/ETH" ? 100 : 1000;
      let depths = {};
      let depths_withfee = {};
      let sorted_depths_withfee = [];
      let symb = symbol.split("/")[0].toLowerCase();
      let processing = false;
      // await check_processing(symbol/*, 'any_with_bfx'*/)
      if (processing == false) {
        setting[symbol].hungry_dog++;
        await Promise.all(
          all_ex.map(async id => {
            depths[id] = await getLastDepth(id, symbol);
            depths_withfee[id] = _.cloneDeep(depths[id]);
            if (
              depths[id] != null &&
              depths[id].bid0[0] != null &&
              depths[id].ask0[0] != null
            ) {
              depths_withfee[id].bid0[0] =
                depths[id].bid0[0] * (1 - feeRate[id]["maker"]);
              depths_withfee[id].ask0[0] =
                depths[id].ask0[0] * (1 + feeRate[id]["maker"]);
              sorted_depths_withfee.push(depths_withfee[id]);
            }
          })
        );

        // log('sorted_depths_withfee', sorted_depths_withfee)
        let s = symbol.split("/");
        let sorted_asks = null;
        let sorted_bids = null;
        let trade_avilable = { sell: 0, buy: 0 };
        // price should contain the transaction fee
        sorted_asks = _.sortBy(sorted_depths_withfee, function(d) {
          return d.ask0[0];
        }).reverse();

        sorted_bids = _.sortBy(sorted_depths_withfee, function(d) {
          return d.bid0[0];
        });

        // log('sorted_asks', sorted_asks)
        // log('sorted_bids', sorted_bids)
        if (_.size(sorted_bids) >= 1 && _.size(sorted_asks) >= 1) {
          let myBid = sorted_bids[0];
          let myAsk = sorted_asks[0];
          // include the fee(myBid myAsk)
          let maxProfitRate = myAsk.ask0[0] / myBid.bid0[0];

          // not include the fee(dpeths)
          let profitRate =
            depths[myAsk.exchange].bid0[0] / depths[myBid.exchange].ask0[0] +
            feeRate[myAsk.exchange]["maker"] +
            feeRate[myBid.exchange]["maker"];
          let profitRateTaker =
            depths[myAsk.exchange].bid0[0] / depths[myBid.exchange].ask0[0] +
            feeRate[myAsk.exchange]["taker"] +
            feeRate[myBid.exchange]["taker"];
          // /myAsk.bid0[0] / myBid.ask0[0]
          // let amount = 0
          let exchangePair = [myAsk.exchange, myBid.exchange];
          let exch_prices = [
            depths[myAsk.exchange].ask0[0],
            depths[myAsk.exchange].bid0[0],
            depths[myBid.exchange].ask0[0],
            depths[myBid.exchange].bid0[0]
          ];

          let smallThreshold = setting[symbol].smallThreshold;
          let threshold = setting[symbol].threshold;
          let bigThreshold = setting[symbol].bigThreshold;
          let dog = setting[symbol].hungry_dog;

          let log_price = util.format(
            "%s s: %s: %f %f %f %f sprd:%f%% b: %s: %f %f %f %f sprd:%f%%",
            myAsk.symbol,
            myAsk.exchange,
            myAsk.ask0[0].toFixed(5),
            myAsk.ask0[1].toFixed(3),
            myAsk.bid0[0].toFixed(5),
            myAsk.bid0[1].toFixed(3),
            (((myAsk.ask0[0] - myAsk.bid0[0]) / myAsk.ask0[0]) * 100).toFixed(
              5
            ),
            myBid.exchange,
            myBid.ask0[0].toFixed(5),
            myBid.ask0[1].toFixed(3),
            myBid.bid0[0].toFixed(5),
            myBid.bid0[1].toFixed(3),
            (((myBid.ask0[0] - myBid.bid0[0]) / myBid.ask0[0]) * 100).toFixed(5)
          );
          log(log_price);
          log(
            new Date(),
            symbol,
            exchangePair,
            " th:",
            threshold,
            "bTh",
            "cnt",
            dog % 10,
            bigThreshold,
            "profitRateTaker",
            profitRateTaker,
            "profitRate:",
            profitRate,
            "maxProfitRate:",
            maxProfitRate,
            " dog:",
            dog,
            /*'last profit:', balances.profit.toFixed(5), */ "processingCnt:",
            processingCnt
          );
          let warning = 0;

          if (
            /*profitRateTaker > smallThreshold &&*/
            profitRate > threshold &&
            maxProfitRate > bigThreshold
          ) {
            warning = 1;
            setting[symbol].hungry_dog = 0;
            let item = {
              symbol: symbol,
              exchangePair: exchangePair,
              profitRateTaker: profitRateTaker,
              profitRate: profitRate,
              maxProfitRate: maxProfitRate,
              // sell_available: balances[myAsk.exchange][s[0]].free * 0.99,
              // buy_available: balances[myBid.exchange][s[1]].free / myAsk.bid0[0] * 0.99,
              sell_price: depths[myAsk.exchange].ask0[0],
              buy_price: depths[myBid.exchange].bid0[0],
              sellExchGap:
                depths[myAsk.exchange].ask0[0] / depths[myAsk.exchange].bid0[0],
              buyExchGap:
                depths[myBid.exchange].ask0[0] / depths[myBid.exchange].bid0[0],
              exch_prices: [
                depths[myAsk.exchange].ask0[0],
                depths[myAsk.exchange].bid0[0],
                depths[myBid.exchange].ask0[0],
                depths[myBid.exchange].bid0[0]
              ]
            };

            log.bright.red(
              new Date(),
              item.symbol,
              item.exchangePair,
              item.profitRateTaker.toFixed(5),
              item.profitRate.toFixed(5),
              /*item.amount,
                            item.sell_available.toFixed(3), item.buy_available.toFixed(3), */ item.sell_price,
              item.buy_price,
              "mP:",
              item.maxProfitRate.toFixed(5),
              " s:",
              item.sellExchGap.toFixed(5),
              " b:",
              item.buyExchGap.toFixed(5),
              " last profit:" /*, balances.profit.toFixed(5),
                            (+balances.summary.others.totalProfitWithFee).toFixed(5),
                            (+balances.summary.others.totalCapital).toFixed(5),
                            (+balances.summary.others.pRate).toFixed(5)*/
            );
            log.bright.red(log_price, " last profit2:");

            // setting[symbol].processing = true

            if (setting[symbol].first_warn == false || dog >= 50) {
              setting[symbol].first_warn = true;
              let subject = util.format(
                "%s, %s %s, %f",
                exchangePair[0],
                exchangePair[1],
                symbol,
                item.profitRate
              );
              let content = util.format(
                "%s, %s %s, \n%j, \n%s",
                symbol,
                exchangePair[0],
                exchangePair[1],
                item,
                log_price
              );

              mail.sendMyMail(mail_to, subject, content);
              if (os.platform() == "darwin") {
                let wav = setting[symbol].reminder_wav_path;
                //play.sound(wav);
              }
            }
          } else {
            // log('No profit discovery among any two exchanges!!!! Please be patient!')
            // 放入另一个函数操作
          }

          let dict2array = function(d) {
            if (d == undefined) return null;

            let l = [];
            for (var key in d) {
              l.push([key, d[key]]);
            }
            return l;
          };

          let save_diff_depth = function(d, side, last_depth) {
            // log.red(d.symbol, last_depth[d.exchange][d.symbol])
            // log.red({asks: dict2array(depths[d.exchange].asks), bids: dict2array(depths[d.exchange].bids)})
            //

            let cur_depth = {
              asks: dict2array(d.asks),
              bids: dict2array(d.bids)
            };
            // log.red(d.exchange, cur_depth)

            if (!_.isEqual(last_depth[d.exchange][d.symbol], cur_depth)) {
              depth_item = {
                exchange: d.exchange,
                datetime: d.website_time,
                symbol: d.symbol,
                dog: dog,
                side: side,
                warning: warning,
                threshold0: profitRateTaker,
                threshold1: profitRate,
                threshold2: maxProfitRate,
                // asks: cur_depth.asks,
                // bids: cur_depth.bids,
                ask_price_0: cur_depth.asks[0][0],
                ask_amount_0: cur_depth.asks[0][1],
                bid_price_0: cur_depth.bids[0][0],
                bid_amount_0: cur_depth.bids[0][1],
                ask_price_1: cur_depth.asks[1][0],
                ask_amount_1: cur_depth.asks[1][1],
                bid_price_1: cur_depth.bids[1][0],
                bid_amount_1: cur_depth.bids[1][1],
                ask_price_2: cur_depth.asks[2][0],
                ask_amount_2: cur_depth.asks[2][1],
                bid_price_2: cur_depth.bids[2][0],
                bid_amount_2: cur_depth.bids[2][1],
                ask_price_3: cur_depth.asks[3][0],
                ask_amount_3: cur_depth.asks[3][1],
                bid_price_3: cur_depth.bids[3][0],
                bid_amount_3: cur_depth.bids[3][1],
                ask_price_4: cur_depth.asks[4][0],
                ask_amount_4: cur_depth.asks[4][1],
                bid_price_4: cur_depth.bids[4][0],
                bid_amount_4: cur_depth.bids[4][1]
              };
              last_depth[d.exchange][d.symbol] = cur_depth;
              // orderlist_buffer.push(depth_item)

              csvWriter.writeRecords([depth_item]).then(() => {
                console.log("...Done");
              });

              // w.writeRecord(depth_item)
              // console.log("buffer:", _.size(orderlist_buffer))
              /*console.log(
                                "buffer last:",
                                orderlist_buffer[_.size(orderlist_buffer) - 1]
                            )
                            */
            } else {
              // console.log(d.exchange, d.symbol, "same depth")
              // console.log("buffer:", _.size(orderlist_buffer))
            }
          };

          save_diff_depth(myAsk, "sell", last_depth);
          save_diff_depth(myBid, "buy", last_depth);

          // if (
          // !_.isEqual(last_depth[myAsk.exchange][myAsk.exchange], {
          // asks: depths[myAsk.exchange].asks,
          // bids: depths[myAsk.exchange].bids
          // })
          //) {
          // depth_item = {
          // exchange: myAsk.exchange,
          // datetime: myAsk.website_time,
          // symbol: myAsk.symbol,
          // dog: dog,
          // side: "sell",
          // warning: warning,
          // threshold0: profitRateTaker,
          // threshold1: profitRate,
          // threshold2: maxProfitRate,
          // asks: depths[myAsk.exchange].asks,
          // bids: depths[myAsk.exchange].bids
          //}
          // last_depth[myAsk.exchange][myAsk.exchange] = {
          // asks: depths[myAsk.exchange].asks,
          // bids: depths[myAsk.exchange].bids
          // }
          // orderlist_buffer.push(depth_item)
          // console.log("buffer:", _.size(orderlist_buffer))
          // console.log(
          // "buffer last:",
          // orderlist_buffer[_.size(orderlist_buffer) - 1]
          // )
          //} else {
          // console.log(myAsk.exchange, myAsk.exchange, "same depth")
          // console.log("buffer:", _.size(orderlist_buffer))
          //}
        }
      } else {
        console.log(symbol, "has trade waiting for finish..");
      }
    } catch (e) {
      /*if (e instanceof ccxt.DDoSProtection) {
        log.bright.yellow(exchange.id, "[DDoS Protection]");
      } else if (e instanceof ccxt.RequestTimeout) {
        log.bright.yellow(exchange.id, "[Request Timeout]");
      } else if (e instanceof ccxt.AuthenticationError) {
        log.bright.yellow(exchange.id, "[Authentication Error]");
      } else if (e instanceof ccxt.ExchangeNotAvailable) {
        log.bright.yellow(exchange.id, "[Exchange Not Available]");
      } else if (e instanceof ccxt.ExchangeError) {
        log.bright.yellow(exchange.id, "[Exchange Error]");
      } else if (e instanceof ccxt.NetworkError) {
        log.bright.yellow(exchange.id, "[Network Error]");
      } else {
        log.bright.red(e);
        await sleep(1000);
        process.exit(1);
      }*/
    }

    if (processingCnt == 0) {
      await sleep(50);
    } else {
      await sleep(300);
    }

    i += 1;
  }
}

async function main() {
  priceWarning();
}
main();
