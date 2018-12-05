/**
 * Created by cdyfng on 23/10/17.
 */
//var logger = require('../common/logger');
var util = require('util');
var config = require('../config');
var mongoose = require('mongoose');
var BaseModel = require("./base_model");
//let Sequence = require('./sequence')

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


/**
  * 存储ID的序列值
  */ /*
SequenceSchema = new Schema({
  _id: String,
  next: Number
});

SequenceSchema.statics.findAndModify = function(query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

SequenceSchema.statics.increment = function(schemaName, callback) {
  return this.collection.findAndModify({
    _id: schemaName
  }, [],
    {
      $inc: {
        next: 1
      }
    }, {
      "new": true,
      upsert: true
    }, callback);
};

//var Sequence = mongoose.model('Sequence', SequenceSchema);
*/
var Sequence = require('./sequence').Sequence


var OrderSchema = mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  parentId: Number,
  subId: Number,
  errCnt: Number,
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  },
  exchangePair: [String],
  profitRate: Number,
  maxProfitRate: Number,
  sellExchGap: Number,
  buyExchGap: Number,
  sExch_ask0: Number,
  sExch_bid0: Number,
  bExch_ask0: Number,
  bExch_bid0: Number,
  exch_prices: [],
  offer_price_type: [],
  prices_history: [],
  filled_history: [],
  orderType: String, //[start, second]
  status: String, //[processing, waiting, pending, partlyfilled, cancelled, success, missed, ]
  exchange: String,
  symbol: String,
  type: String,
  side: String,
  amount: Number,
  price: Number,
  order_ids: [],
  order_details: [],
  filledList:[],
  filled: {
    type: Number,
    default: 0
  }, //完成的
  remaind: Number, //剩余的
  cur_ask0: Number,
  cur_bid0: Number,
  stopLostPrice: Number,
  final_profit: Number,
  final_profitRate: Number,
});
OrderSchema.plugin(BaseModel);
OrderSchema.index({
  id: 1,
  subId: 1,
  status: 1,
  create_at: -1,
  exchange: 1,
});


//在创建文档时，获取自增ID值
OrderSchema.pre('save', function(next) {
  console.log('pre save in ')
  var self = this;
  if (self.isNew) {
    Sequence.increment('Order', function(err, result) {
      if (err)
        throw err;
      //console.log('result next:', result)
      self.id = result.value.next;
      next();
    });
  } else {
    next();
  }
})

//db schema design => auto inc id, main id, timestamp, minProfitRate, maxProfitRate,
//     sellExchanGap, buyExchGap, sExch_ask0, sExch_bid0, bExch_ask0, sExch_bid0,
//     orderType[start, second], status[processing, waiting, cancelled, success, missed, ],
//     exchange, symbol, type, direction, amount, price, order_ids, order_details,
//     cur_ask0, cur_bid0, stopLostPrice
var Order = mongoose.model('Order', OrderSchema);
