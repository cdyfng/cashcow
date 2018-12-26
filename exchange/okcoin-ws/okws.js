const pako = require("pako");

const WebSocket = require("ws");
let cache = require("../../common/cache");

// url

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


function start_ws() {
  const ws = new WebSocket("wss://real.okex.com:10441/websocket?compress=true");
  ws.on("open", function open() {
    // ws.send('{"channel":"ok_sub_futureusd_btc_depth_quarter","event":"addChannel"}')
    ws.send('{"channel":"ok_sub_spot_eth_btc_depth_5","event":"addChannel"}');
    ws.send('{"channel":"ok_sub_spot_eos_btc_depth_5","event":"addChannel"}');
    ws.send('{"channel":"ok_sub_spot_bch_btc_depth_5","event":"addChannel"}');
    ws.send('{"channel":"ok_sub_spot_bsv_btc_depth_5","event":"addChannel"}');
  });

  ws.on("message", function incoming(data) {
    if (data instanceof String) {
      console.log("1", data);
    } else {
      try {
        check_depth(JSON.parse(pako.inflateRaw(data, { to: "string" })));
      } catch (err) {
        console.log(err);
      }
    }
  });

  return ws
}




let channel_symbol = new Map([
  ["ok_sub_spot_eth_btc_depth_5", "ETH/BTC"],
  ["ok_sub_spot_eos_btc_depth_5", "EOS/BTC"],
  ["ok_sub_spot_bch_btc_depth_5", "BCH/BTC"],
  ["ok_sub_spot_bsv_btc_depth_5", "BSV/BTC"]
]);

async function check_depth(d) {
  //prices, symbol
  try {
    let channel = d[0].channel;
    //console.log("channel: :", typeof d, channel, d);
    for (var [key, symbol] of channel_symbol) {
      //console.log("loop: ", key, symbol);
      if (channel == key) {
        //console.log("processing", key + " = " + symbol);
        let data = d[0].data;
        let spread = +data.asks[data.asks.length - 1][0] - +data.bids[0][0];

        let depth = {
          website_time: new Date(data.timestamp),
          exchange: "okex",
          symbol: symbol,
          ask0: [
            +data.asks[data.asks.length - 1][0],
            +data.asks[data.asks.length - 1][1]
          ],
          bid0: [+data.bids[0][0], +data.bids[0][1]]
        };
        let asks = [];
        data.asks.forEach(function(i) {
          asks.push([+i[0], +i[1]]);
        });
        asks = asks.reverse();
        let bids = [];
        data.bids.forEach(function(i) {
          bids.push([+i[0], +i[1]]);
        });
        depth.asks = asks;
        depth.bids = bids;

        console.log(
          new Date(),
          symbol,
          "Bid: ",
          bids[0][0],
          "@",
          bids[0][1],
          "Ask:",
          asks[0][0],
          "@",
          asks[0][1],
          "Spread",
          spread,
          "rate",
          asks[0][0] / bids[0][0]
        );
        //console.log("bids:", bids);
        //console.log("asks:", asks);
        cache.set("okex" + symbol, depth, function() {
          //console.log('b.')
          // cache.get('bitfinexBCH/BTC', function (err, data) {
          //   console.log('data: ', data)
          // })
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
}


async function main(){
  let loop = 1
  while(true){
    console.log('start...', loop)
    let ws = start_ws()
    await sleep(5 * 60 * 1000)
    ws.close()
    console.log('close...', loop++)
    await sleep(5 * 1000)

  }

}

main()
