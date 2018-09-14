var OKCoin = require('./index.js');
let Depth = require('../../proxy').Depth
let cache = require('../../common/cache');
var _ = require('lodash');
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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
    if (depth1 == null || depth2 == null) {
      console.log('null depth', depth1, depth2)
      return false
    }


    if (!equal_array(depth1['ask0'], depth2['ask0'])) {
      console.log('dept ask0 not equal:', depth1['ask0'], depth2['ask0'])
      return false
    }


    if (!equal_array(depth1['bid0'], depth2['bid0'])) {
      console.log('dept bid0 not equal:', depth1['bid0'], depth2['bid0'])
      return false
    }



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

async function check_depth(prices, /*old_depth,*/ symbol) {
  try {
    let old_depth
    if (symbol == 'ETH/BTC')
      old_depth = eth_old_depth
    else if (symbol == 'BCH/BTC')
      old_depth = bch_old_depth
    else if (symbol == 'EOS/BTC')
      old_depth = eos_old_depth
    else if (symbol == 'EOS/ETH')
      old_depth = eoseth_old_depth
    else if (symbol == 'BTG/BTC')
      old_depth = btg_old_depth
    else if (symbol == 'BCH/ETH')
      old_depth = bcheth_old_depth


    const spread = +prices.asks[_.size(prices.asks) - 1][0] - +prices.bids[0][0]
    //console.log(updatedBook)
    //orderbook_0.bid_price = prices.bid[0];
    //orderbook_0.bid_amount = updatedBook.bid[prices.bid[0]].AMOUNT;
    //orderbook_0.ask_price = prices.ask[0];
    //orderbook_0.ask_amount = updatedBook.ask[prices.ask[0]].AMOUNT * -1;
    let depth = {
      website_time: new Date(prices.timestamp),
      exchange: 'okex',
      symbol: symbol,
      ask0: [+prices.asks[_.size(prices.asks) - 1][0], +prices.asks[_.size(prices.asks) - 1][1]],
      bid0: [+prices.bids[0][0], +prices.bids[0][1]]
    }

    if (!isSameDepth(depth, old_depth)) {
      //console.log('depth:', depth)

      console.log(
        new Date(), symbol, 'Bid: ', prices.bids[0][0], '@', prices.bids[0][1],
        'Ask:', prices.asks[_.size(prices.asks) - 1][0], '@', prices.asks[_.size(prices.asks) - 1][1], 'Spread', spread,
        'rate', prices.asks[_.size(prices.asks) - 1][0] / prices.bids[0][0]
      )

      if (depth != null) {
        //console.log(new Date(depths[exchange_id].timestamp))
        //let out = await Depth.NewDepth(depth)
       /*{
            website_time: new Date(depths[exchange_id].timestamp),
            exchange: exchange_id,
            symbol: symbol,
            ask0: depth.ask0,
            bid0: depth.bid0,
          }*/
          cache.set('okex'+symbol, depth, function () {
            //console.log('b.')
            // cache.get('bitfinexBCH/BTC', function (err, data) {
            //   console.log('data: ', data)
            // })
          })

      //console.log(out)
      }

      if (symbol == 'ETH/BTC')
        eth_old_depth = depth
      else if (symbol == 'BCH/BTC')
        bch_old_depth = depth
      else if (symbol == 'EOS/BTC')
        eos_old_depth = depth
      else if (symbol == 'EOS/ETH')
        eoseth_old_depth = depth
      else if (symbol == 'BTG/BTC')
        btg_old_depth = depth
      else if (symbol == 'BCH/ETH')
        bcheth_old_depth = depth
    //old_depth = depth
    } else {
      ///console.log('.')
    }

  } catch (e) {
    console.log(e)
  }
}

let bch_old_depth = null
let eth_old_depth = null
let eos_old_depth = null
let eoseth_old_depth = null
let btg_old_depth = null
let bcheth_old_depth = null
async function main() {
  while (true) {

    var okcoin = new OKCoin('cn');
    okcoin.subscribe({
      'ok_sub_spot_bch_btc_depth_5': function cb(data, err) {
        if (err) return console.log(err)()

        check_depth(data, /*bch_old_depth,*/ 'BCH/BTC')
      //console.log('bch', new Date(data.timestamp), data)
      }
    });

    okcoin.subscribe({
      'ok_sub_spot_eth_btc_depth_5': function cb(data, err) {
        if (err) return console.log(err)
        check_depth(data, 'ETH/BTC')
      //console.log('eth:', new Date(data.timestamp), data)
      }
    });

    okcoin.subscribe({
      'ok_sub_spot_eos_btc_depth_5': function cb(data, err) {
        if (err) return console.log(err)
        check_depth(data, 'EOS/BTC')
      //console.log('eth:', new Date(data.timestamp), data)
      }
    });

    okcoin.subscribe({
      'ok_sub_spot_eos_eth_depth_5': function cb(data, err) {
        if (err) return console.log(err)
        check_depth(data, 'EOS/ETH')
      //console.log('eth:', new Date(data.timestamp), data)
      }
    });

    okcoin.subscribe({
      'ok_sub_spot_btg_btc_depth_5': function cb(data, err) {
        if (err) return console.log(err)
        check_depth(data, 'BTG/BTC')
      //console.log('eth:', new Date(data.timestamp), data)
      }
    });

    //无此交易对
    // okcoin.subscribe({
    //   'ok_sub_spot_bch_eth_depth_5': function cb(data, err) {
    //     if (err) return console.log(err)
    //     check_depth(data, 'BCH/ETH')
    //   //console.log('eth:', new Date(data.timestamp), data)
    //   }
    // });


    console.log('start...')
    await sleep(6 * 60 * 1000)
    console.log('stop...')
    okcoin.close()
    await sleep(10 * 1000)
    console.log('next loop')
  }
}

main()
