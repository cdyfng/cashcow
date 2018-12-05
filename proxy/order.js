var EventProxy = require('eventproxy');
var models = require('../models');
const log = require('ololog').configure({
  locate: false
})

var _ = require('lodash');
var Order = models.Order;

exports.getMaxId = function(callback) {
  Order.find({
  }, callback);
};

exports.getMaxParentId = async function(){
  return new Promise(function(resolve,reject){
    Order.find({},function(err, parentIds){
      if(err) log.bright.red('getMaxParentId err:', err)
      resolve(parentIds)
    }
  ).sort({ create_at: -1 }).limit(1).select({ parentId: 1})
  })
}

exports.lastNOrders = async function(query, n) {
  return new Promise(function(resolve, reject) {
    Order.find(
      query, function(err, orders) {
        console.log('proxy: ', _.size(orders))
        resolve(orders)
      }).sort({ id: -1 }).limit(n)
  });

}

exports.newGetOrders = async function(query) {
  return new Promise(function(resolve, reject) {
    Order.find(
      query, function(err, orders) {
        //console.log('proxy: ')
        resolve(orders)
      })
  });

}

//得到给定交易所，数据库中，价格偏差最大的2个订单
//输入 exchangePairs
//当前价格
//输出 order
exports.getTwoReorders = function(trade) {}

exports.promiseNewAndSave = function(order_plain) {
  return new Promise(function(resolve, reject) {
    var order = new Order(order_plain);
    //log.bright.yellow('new id order in :', order)
    order.save(function(err, orderOut) {
      if (err) log.bright.red('promiseNewAndSave err:', err)
      //log.bright.red('new id', orderOut)
      //log.bright.red('new id', order._id, order.subId)
      resolve(orderOut)
    })
  });
};


exports.getOrders = async function(query, callback) {
  //let query = queryß
  var proxy = new EventProxy();
  var events = ['orders'];
  proxy.assign(events, function(orders) {
    if (!orders) {
      //console.log('null orders')
      return callback(null);
    //return res.send("no transaction");
    }
    return callback(orders);
  //res.send(transaction.txhash);
  }).fail(callback);

  console.log('query:', query)
  await Order.find(
    query
    , proxy.done(function(orders) {
      //console.log('o', orders)
      if (!orders) {
        proxy.emit('orders', null);
        return;
      }
      proxy.emit('orders', orders);
    }));

  console.log('after await order find')
};
/*
exports.getCountByQuery = function(query, callback) {
  Order.count(query, callback);
};

// for sitemap
exports.getBlockTransactions = function(block, callback) {
  Order.find({
    block: block
  }, callback);
};
*/

exports.newAndSave = function(order, callback) {
  var order = new Order(order);
  //log.bright.red('old new id', order.subId)
  order.save(callback);
};


exports.Edit = function(order, callback) {
  //var order = new Order(order);
  order.update_at = new Date()
  order.save(callback);
};

exports.promiseEdit = function(order) {
  log.bright.red('promiseEdit', order.id)
  return new Promise(function(resolve, reject) {
    order.update_at = new Date()
    order.save(function(err, result) {
      log.bright.red('promiseEdit over', order.id)
      resolve(result)
    });
  });
}
