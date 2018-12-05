var express = require('express');
var router = express.Router();
//var Order = require('../../proxy').Order
//var Asset = require('../../proxy').Asset
let cache = require('../../common/cache');
var _ = require('lodash');

/* GET users listing. */
router.get('/', async function(req, res, next) {

  //let parentIds = []//await Order.getMaxParentId()
  // let totalOrders = await Order.newGetOrders({
  //   symbol: 'BCH/BTC',
  //   //exchange: exchange,
  //   status: {
  //     '$in': ['finished', 'error']
  //   }
  // })
  let asset = await cache.promiseGet('asset')
  //let asset = await Asset.GetLastestAssets({})
  /*_.forEach(all_ex, function(exchange) {
    out[exchange] = out.detail[exchange]
    let balance = out[exchange]
    log.bright.red(exchange, 'BTC:', balance['BTC'].free.toFixed(5), ' ETH:', balance['ETH'].free.toFixed(5),
    ' BCH:', balance['BCH'].free.toFixed(5), ' EOS:', balance['EOS'].free.toFixed(5), ' BTG:', balance['BTG'].free.toFixed(5))
    log(exchange, 'BTC:', balance['BTC'].total.toFixed(5), ' ETH:', balance['ETH'].total.toFixed(5),
    ' BCH:', balance['BCH'].total.toFixed(5), ' EOS:', balance['EOS'].total.toFixed(5), ' BTG:', balance['BTG'].total.toFixed(5))
  })
  */
  //console.log('parentIds:', _.size(parentIds), parentIds)
  let num = 0//parentIds[0].parentId
  //res.send('respond with a resource');
  res.render('assets', { title: 'Asset Info' ,date: new Date(), num: num, asset: asset});
});

module.exports = router;
