'use strict'

const BFX = require('bitfinex-api-node')
let Depth = require('../proxy').Depth
let cache = require('../common/cache');

//const BFX = require('../')
/*
var orderbook_0 = {
  bid_price: 0,
  bid_amount: 0,
  ask_price: 0,
  ask_amount: 0
};
*/

function WSocket() {
  this.API_KEY = 'secret'
  this.API_SECRET = 'secret'
  this.opts = {
    version: 2,
    transform: true
  }
  this.bws = new BFX(this.API_KEY, this.API_SECRET, this.opts).ws

  // ES 6 Map would be also possible
  this.orderbook = {
    bid: {},
    ask: {}
  }
  this.old_depth = null

  // function start() {
  //   bws.on('open', () => {
  //     //bws.subscribeOrderBook()
  //     //bws.subscribeOrderBook('EOSETH')
  //     bws.subscribeOrderBook('ETHBTC')
  //   })
  //
  //   bws.on('orderbook', (pair, rec) => {
  //     updateOrderbook(orderbook, rec, pair)
  //   })
  // }

  function isSnapshot(data) {
    return Array.isArray(data)
  }

  // Trading: if AMOUNT > 0 then bid else ask;
  // Funding: if AMOUNT < 0 then bid else ask;
  function bidOrAsk(el, type = 't') {
    if (type === 't' && el.AMOUNT > 0) {
      return 'bid'
    }
    if (type === 't' && el.AMOUNT < 0) {
      return 'ask'
    }

    if (type === 'f' && el.AMOUNT > 0) {
      return 'ask'
    }
    if (type === 'f' && el.AMOUNT < 0) {
      return 'bid'
    }

    throw new Error('unknown type')
  }

  function getType(pair) {
    return pair[0]
  }

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


  this.updateOrderbook = function(orderbook, rec, pair) {
    const type = getType(pair)

    let updatedBook
    if (isSnapshot(rec)) {
      updatedBook = rec.reduce((acc, el) => {
        const branch = bidOrAsk(el, type)
        orderbook[branch][el.PRICE] = el
        return orderbook
      }, orderbook)

      return
    }

    updatedBook = updateBookEntry(orderbook, rec)
    const prices = sortPrices(updatedBook)

    try {
      const spread = prices.bid[0] - prices.ask[0]
      //console.log(updatedBook)
      //orderbook_0.bid_price = prices.bid[0];
      //orderbook_0.bid_amount = updatedBook.bid[prices.bid[0]].AMOUNT;
      //orderbook_0.ask_price = prices.ask[0];
      //orderbook_0.ask_amount = updatedBook.ask[prices.ask[0]].AMOUNT * -1;
      let depth = {
        website_time: new Date(),
        exchange: 'bitfinex',
        symbol: this.symbol,
        ask0: [+prices.ask[0], Math.abs(updatedBook.ask[prices.ask[0]].AMOUNT)],
        bid0: [+prices.bid[0], updatedBook.bid[prices.bid[0]].AMOUNT]
      }

      if (!isSameDepth(depth, this.old_depth)) {
        //console.log('depth:', depth)

        console.log(
          new Date(), this.symbol, 'Bid: ', prices.bid[0], '@', updatedBook.bid[prices.bid[0]].AMOUNT,
          'Ask:', prices.ask[0], '@', updatedBook.ask[prices.ask[0]].AMOUNT, 'Spread', spread,
          'rate', prices.ask[0] / prices.bid[0]
        )

        if (depth != null) {
          //console.log(new Date(depths[exchange_id].timestamp))
          //let out =  Depth.NewDepth(depth )
          cache.set('bitfinex'+this.symbol, depth, function () {
            //console.log('b.')
            // cache.get('bitfinexBCH/BTC', function (err, data) {
            //   console.log('data: ', data)
            // })
          })

        //console.log(out)
        }

        this.old_depth = depth
      } else {
        ///console.log('.')
      }

    } catch (e) {
      console.log(e)
    }

  }

  function updateBookEntry(orderbook, rec) {
    const {COUNT, AMOUNT, PRICE} = rec
    // when count = 0 then you have to delete the price level.
    if (COUNT === 0) {
      // if amount = 1 then remove from bids
      if (AMOUNT === 1) {
        delete orderbook.bid[PRICE]
        return orderbook
      } else if (AMOUNT === -1) {
        // if amount = -1 then remove from asks
        delete orderbook.ask[PRICE]
        return orderbook
      }

      console.error('[ERROR] amount not found', rec)
      return orderbook
    }

    // when count > 0 then you have to add or update the price level
    if (COUNT > 0) {
      // 3.1 if amount > 0 then add/update bids
      if (AMOUNT > 0) {
        orderbook.bid[PRICE] = rec
        return orderbook
      } else if (AMOUNT < 0) {
        // 3.2 if amount < 0 then add/update asks
        orderbook.ask[PRICE] = rec
        return orderbook
      }

      console.error('[ERROR] side not found', rec)
      return orderbook
    }
  }

  function sortPrices(book) {
    const res = {}
    res.bid = Object.keys(book.bid).sort((a, b) => {
      return +a >= +b ? -1 : 1
    })
    res.ask = Object.keys(book.ask).sort((a, b) => {
      return +a <= +b ? -1 : 1
    })

    return res
  }

  // eslint-disable-next-line no-unused-vars
  function testUpdateBookEntry() {
    const assert = require('assert')

    const book = {
      bid: {
        '1968.8': {
          PRICE: 1968.8,
          COUNT: 1,
          AMOUNT: 0.1
        },
        '1970.5': {
          PRICE: 1970.5,
          COUNT: 1,
          AMOUNT: 2
        },
        '1970.7': {
          PRICE: 1970.7,
          COUNT: 1,
          AMOUNT: 2
        }
      },

      ask: {
        '1968.8': {
          PRICE: 1968.8,
          COUNT: 1,
          AMOUNT: 0.1
        },
        '1970.5': {
          PRICE: 1970.5,
          COUNT: 1,
          AMOUNT: 2
        },
        '1970.7': {
          PRICE: 1970.7,
          COUNT: 1,
          AMOUNT: 2
        }
      }
    }

    const clone = (o) => {
      return JSON.parse(JSON.stringify(o))
    }

    let cBook,
      res
    // deletes bids
    cBook = clone(book)
    res = updateBookEntry(cBook, {
      PRICE: 1970.5,
      COUNT: 0,
      AMOUNT: 1
    })

    assert.deepEqual(
      res,
      {
        bid: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        },

        ask: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: 2
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        }
      }
    )

    // deletes asks
    cBook = clone(book)
    res = updateBookEntry(cBook, {
      PRICE: 1970.5,
      COUNT: 0,
      AMOUNT: -1
    })
    assert.deepEqual(
      res,
      {
        bid: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: 2
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        },

        ask: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        }
      }
    )

    // updates bids
    cBook = clone(book)
    res = updateBookEntry(cBook, {
      PRICE: 1970.5,
      COUNT: 1,
      AMOUNT: 0.48
    })
    assert.deepEqual(
      res,
      {
        bid: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: 0.48
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        },

        ask: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: 2
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        }
      }
    )

    // deletes asks
    cBook = clone(book)
    res = updateBookEntry(cBook, {
      PRICE: 1970.5,
      COUNT: 1,
      AMOUNT: -1
    })

    assert.deepEqual(
      res,
      {
        bid: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: 2
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        },

        ask: {
          '1968.8': {
            PRICE: 1968.8,
            COUNT: 1,
            AMOUNT: 0.1
          },
          '1970.5': {
            PRICE: 1970.5,
            COUNT: 1,
            AMOUNT: -1
          },
          '1970.7': {
            PRICE: 1970.7,
            COUNT: 1,
            AMOUNT: 2
          }
        }
      }
    )
  }

  // eslint-disable-next-line no-unused-vars
  function testSortPrices() {
    const assert = require('assert')

    const book = {
      bid: {
        '1968.8': {
          PRICE: 1968.8,
          COUNT: 1,
          AMOUNT: 0.1
        },
        '1970.5': {
          PRICE: 1970.5,
          COUNT: 1,
          AMOUNT: 2
        },
        '1970.7': {
          PRICE: 1970.7,
          COUNT: 1,
          AMOUNT: 2
        }
      },

      ask: {
        '1968.8': {
          PRICE: 1968.8,
          COUNT: 1,
          AMOUNT: 0.1
        },
        '1970.5': {
          PRICE: 1970.5,
          COUNT: 1,
          AMOUNT: 2
        },
        '1970.7': {
          PRICE: 1970.7,
          COUNT: 1,
          AMOUNT: 2
        }
      }
    }

    const expected = {
      // ASC
      bid: [
        1970.7,
        1970.5,
        1968.8
      ],
      // DESC
      ask: [
        1968.8,
        1970.5,
        1970.7
      ]
    }

    const res = sortPrices(book)

    assert.deepEqual(res, expected)
  }

}

WSocket.prototype.start2 = function() {
  // this.someProperty = "modified value";
  console.log("called from prototype");
}

//"EOSETH", "BCCETH", "EOSUSDT", "ETHUSDT", "BCCUSDT", "BTCUSDT"
WSocket.prototype.start = function(symbol) {
  if (symbol == 'ETH/BTC') {
    this.symbol = symbol
    this.subscribSymbol = 'ETHBTC'
  } else if (symbol == 'BCH/BTC') {
    this.symbol = symbol
    this.subscribSymbol = 'BCHBTC'
  } else if (symbol == 'EOS/BTC') {
    this.symbol = symbol
    this.subscribSymbol = 'EOSBTC'
  } else if (symbol == 'EOS/ETH') {
    this.symbol = symbol
    this.subscribSymbol = 'EOSETH'
  } else if (symbol == 'BTG/BTC') {
    this.symbol = symbol
    this.subscribSymbol = 'BTGBTC'
  } else if (symbol == 'EOS/USDT') {
    this.symbol = symbol
    this.subscribSymbol = 'EOSUSDT'
  } else if (symbol == 'ETH/USDT') {
    this.symbol = symbol
    this.subscribSymbol = 'ETHUSDT'
  } else if (symbol == 'BCH/USDT') {
    this.symbol = symbol
    this.subscribSymbol = 'BCHUSDT'
  } else if (symbol == 'BTC/USDT') {
    this.symbol = symbol
    this.subscribSymbol = 'BTCUSDT'
  } else {
    throw 'Wrong symbol', symbol
  }

  this.bws.on('open', () => {
    //bws.subscribeOrderBook()
    //bws.subscribeOrderBook('EOSETH')
    this.bws.subscribeOrderBook(this.subscribSymbol)
  })

  this.bws.on('orderbook', (pair, rec) => {
    this.updateOrderbook(this.orderbook, rec, pair)
  })
}

WSocket.prototype.close = function() {
  this.bws.close()
}

//exports.orderbook_0 = orderbook_0;
////exports.start = start;
////module.exports = WSocket
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  while (true) {
    let ws = new WSocket()
    let ws2 = new WSocket()
    let ws3 = new WSocket()
    let ws4 = new WSocket()
    let ws5 = new WSocket()
    let ws6 = new WSocket()
    let ws7 = new WSocket()
    let ws8 = new WSocket()
    let ws9 = new WSocket()

    console.log('start...')
    //ws.start('BCH/BTC')
    //ws2.start('ETH/BTC')
    //ws3.start('EOS/BTC')
    //ws4.start('EOS/ETH')
    //ws5.start('BTG/BTC')
    ws6.start('BCH/USDT')
    ws7.start('ETH/USDT')
    ws8.start('EOS/USDT')
    ws9.start('BTC/USDT')
    await sleep(3 * 60 * 1000)
    console.log('stop...')
    //ws.close()
    //ws2.close()
    //ws3.close()
    //ws4.close()
    //ws5.close()
    ws6.close()
    ws7.close()
    ws8.close()
    ws9.close()
    await sleep(5 * 1000)
    console.log('next loop')
  }
}

main()
// testSortPrices()
// testUpdateBookEntry()
////start()
//module.exports = BFX_orderbook;
