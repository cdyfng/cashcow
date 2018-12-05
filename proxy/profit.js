var EventProxy = require('eventproxy');
var models = require('../models');
const log = require('ololog').configure({
  locate: false
})

var Profit = models.Profit;

exports.getMaxParentId = async function(){
  return new Promise(function(resolve,reject){
    Profit.find({},function(err, parentIds){
      if(err) log.bright.red('getMaxParentId err:', err)
      resolve(parentIds)
    }
    ).sort({ id: -1 }).limit(1).select({ parentId: 1})
  })
}

exports.newGetProfits = async function(query) {
  return new Promise(function(resolve, reject) {
    Profit.find(
      query, function(err, profits) {
        //console.log('proxy: ')
        resolve(profits)
      })
  });

}

exports.promiseNewAndSave = function(profit_plain) {
  return new Promise(function(resolve, reject) {
    var profit = new Profit(profit_plain);
    //log.bright.yellow('new id order in :', order)
    profit.save(function(err, profitOut) {
      if (err) log.bright.red('promiseNewAndSave err:', err)
      //log.bright.red('new id', orderOut)
      //log.bright.red('new id', order._id, order.subId)
      resolve(profitOut)
    })
  });
};

exports.promiseEdit = function(profit) {
  return new Promise(function(resolve, reject) {
    profit.update_at = new Date()
    profit.save(function(err, result) {
      //log.bright.red('promise edit id', result.subId)
      resolve(result)
    });
  });
}
