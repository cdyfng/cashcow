'use strict'
let cache = require('../common/cache')

process.env.DEBUG = 'bfx:examples:*'

const debug = require('debug')('bfx:examples:ws2_order_books')
const bfx = require('./bfx')

const ws = bfx.ws(2, {
  manageOrderBooks: true, // tell the ws client to maintain full sorted OBs
  transform: true // auto-transform array OBs to OrderBook objects
})

ws.on('error', (err) => {
  debug('error: %j', err)
})


let symbols = {
  'BTC/USDT':'tBTCUSD',
  'ETH/BTC':'tETHBTC',
  'EOS/BTC':'tEOSBTC',
  'BSV/BTC':'tBSVBTC',
  'BCH/BTC':'tBABBTC',
}

let old_depths = {
  'BTC/USDT':-1,
  'ETH/BTC':-1,
  'EOS/BTC':-1,
  'BSV/BTC':-1,
  'BCH/BTC':-1,
}

let lastMidPrice = -1
let midPrice

ws.on('open', () => {
  debug('open')
  //ws.subscribeOrderBook('tBTCUSD')
  ws.subscribeOrderBook(symbols['BTC/USDT'])
  ws.subscribeOrderBook(symbols['ETH/BTC'])
  ws.subscribeOrderBook(symbols['EOS/BTC'])
  ws.subscribeOrderBook(symbols['BSV/BTC'])
  ws.subscribeOrderBook(symbols['BCH/BTC'])
})

  function equal_array(array, array2) {
    if (!array || !array2)
      return false;

    // compare lengths - can save a lot of time
    if (array2.length != array.length)
      return false;

    for (var i = 0, l = array2.length; i < l; i++) {
      // Check if we have nested arrays
      /*if (array2[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;
      } else */
      if (array2[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  }

  function isSameDepth(depth1, depth2) {
    try {
      if (depth1 == null || depth2 == null)
        return false

      if (!equal_array(depth1['ask0'], depth2['ask0']))
        return false

      if (!equal_array(depth1['bid0'], depth2['bid0']))
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

let process_ob = function(symbol, ob){

     let depth = {
        website_time: new Date(),
        exchange: 'bitfinex',
        symbol: symbol,
        ask0: [+ob.asks[0][0], Math.abs(ob.asks[0][2])],
        bid0: [+ob.bids[0][0], ob.bids[0][2]],
      }
      if (!isSameDepth(depth, old_depths[symbol])) {
        //console.log('depth:', depth)
        let spread = +ob.asks[0][0] - ob.bids[0][0]




        if (depth != null) {
          //console.log(new Date(depths[exchange_id].timestamp))
          //let out =  Depth.NewDepth(depth )
          cache.set('bitfinex'+depth.symbol, depth, function () {
            //console.log('b.')
            // cache.get('bitfinexBCH/BTC', function (err, data) {
            //   console.log('data: ', data)
            // })
          })

        //console.log(out)
        }
        let asks = []; ob.asks.forEach(function(i){asks.push([[i[0], i[2]]])});
        let bids = []; ob.bids.forEach(function(i){bids.push([[i[0], i[2]]])});
        depth.asks = asks
        depth.bids = bids
        console.log(
          new Date(), depth.symbol, 'Bid: ', +ob.bids[0][0], '@', ob.bids[0][2],
          'Ask:', +ob.asks[0][0], '@', Math.abs(ob.asks[0][2]), 'Spread', spread,
          'rate', ob.asks[0][0] / ob.bids[0][0]
        )
        old_depths[symbol] = depth
      } 

}

// 'ob' is a full OrderBook instance, with sorted arrays 'bids' & 'asks'
ws.onOrderBook({ symbol: symbols['BCH/BTC'] }, (ob) => {
  process_ob('BCH/BTC', ob)
})
ws.onOrderBook({ symbol: symbols['BSV/BTC'] }, (ob) => {
  process_ob('BSV/BTC', ob)
})
ws.onOrderBook({ symbol: symbols['EOS/BTC'] }, (ob) => {
  process_ob('EOS/BTC', ob)
})
ws.onOrderBook({ symbol: symbols['ETH/BTC'] }, (ob) => {
  process_ob('ETH/BTC', ob)
})
ws.onOrderBook({ symbol: symbols['BTC/USDT'] }, (ob) => {
  process_ob('BTC/USDT', ob)
  // midPrice = ob.midPrice()

  // if (midPrice !== lastMidPrice) {
  //   debug(
  //     'BTCUSD mid price: %d (bid: %d, ask: %d)',
  //     midPrice, ob.bids[0][0], ob.asks[0][0]
  //   )
  // }
})

ws.open()
