const WebSocket = require('ws');
let Depth = require('../proxy').Depth
let cache = require('../common/cache');

const baseUrl = 'wss://api.hitbtc.com/api/2/ws';

var ws = new WebSocket(baseUrl)
ws.on('open', function() {
    console.log('open');
    ws.send(JSON.stringify({
      //"method": "getCurrency",
      "method": "subscribeOrderbook",
      "params": {
        "symbol": "ETHBTC"
      },
      "id": 123
    }));
    ws.send(JSON.stringify({
      //"method": "getCurrency",
      "method": "subscribeOrderbook",
      "params": {
        "symbol": "BCHBTC"
      },
      "id": 124
    }));
    ws.send(JSON.stringify({
      //"method": "getCurrency",
      "method": "subscribeOrderbook",
      "params": {
        "symbol": "EOSBTC"
      },
      "id": 125
    }));
})

ws.on('message', function incoming(data) {
    //console.log(1);
    //console.log(data);
    process_data(JSON.parse(data))
});

// var ws2 = new WebSocket(baseUrl)
// ws2.on('open', function() {
//     console.log('open');
//     ws.send(JSON.stringify({
//       //"method": "getCurrency",
//       "method": "subscribeOrderbook",
//       "params": {
//         "symbol": "BCHBTC"
//       },
//       "id": 124
//     }));
// })
//
// ws2.on('message', function incoming(data) {
//     console.log(2);
//     //console.log(data);
//     process_data(JSON.parsedata(data))
// });


let symbols_map = {
  'EOSBTC':'EOS/BTC',
  'ETHBTC':'ETH/BTC',
  'BCHBTC':'BCH/BTC',
  'EOSETH':'EOS/ETH',
}

//let order = {bid:{}, ask:{}}
let order_map = {
  'EOSBTC':{bid:{}, ask:{}},
  'ETHBTC':{bid:{}, ask:{}},
  'BCHBTC':{bid:{}, ask:{}},
  'EOSETH':{bid:{}, ask:{}},
}
let © = {
  'EOS/BTC': null,
  'ETH/BTC': null,
  'BCH/BTC': null,
}


let process_data = function(data){
  if(data.params != undefined){
    let symbol = data.params.symbol
    let order = order_map[symbol]
    // console.log(data['params']['symbol'],
    // data['params']['ask'].length,
    // data['params']['bid'].length)
    data.params.ask.forEach(function(item){
      //console.log(item)
      if(item.size == '0.000')
        delete order.ask[item.price]
      else {
        order.ask[item.price] = item.size
      }
    })
    let sorted_ask = Object.keys(order.ask).sort(function(a, b){return parseFloat(a)-parseFloat(b)});


    data.params.bid.forEach(function(item){
      if(item.size == '0.000')
        delete order.bid[item.price]
      else {
        order.bid[item.price] = item.size
      }
    })


    //console.log('s:', sorted_ask.length, sorted_bid.lenght)
    let sorted_bid = Object.keys(order.bid).sort(function(a, b){return parseFloat(b)-parseFloat(a)});
    console.log( symbol, sorted_ask[0], order.ask[sorted_ask[0]], sorted_bid[0], order.bid[sorted_bid[0]], sorted_ask.length, sorted_bid.length)

    let dep = {
    website_time: new Date(),
    exchange: 'hitbtc',
    symbol: symbols_map[symbol],
    ask0: [+sorted_ask[0], +order.ask[sorted_ask[0]]],
    bid0: [+sorted_bid[0], +order.bid[sorted_bid[0]]]
    }
    if(!isSameDepth(cache_sym_depth[symbols_map[symbol]], dep)){
      //Depth.NewDepth(dep)
      cache.set('hitbtc'+symbols_map[symbol], dep, function () {
        //console.log('b.')
        // cache.get('bitfinexBCH/BTC', function (err, data) {
        //   console.log('data: ', data)
        // })
      })
      cache_sym_depth[symbols_map[symbol]] = dep
    }else{
      console.log(symbols_map[symbol]+" same Depth error");
    }

  }
}

function isSameDepth(depth1, depth2) {
  try {
    if (depth1 == null || depth2 == null)
      return false

    if (depth1['ask0'][0] != depth2['ask0'][0]
        ||depth1['ask0'][1] != depth2['ask0'][1]
        ||depth1['bid0'][0] != depth2['bid0'][0]
        ||depth1['bid0'][1] != depth2['bid0'][1])
      return false

    let time_diffrence = depth1.website_time - depth2.website_time
    if (time_diffrence > 1000) {

      console.log('should return for time_diffrence:', time_diffrence)
      return false
    }
    return true

  } catch (e) {
    console.log(e)
    return false
  }

}
