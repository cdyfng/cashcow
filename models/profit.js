/**
 * Created by cdyfng on 23/01/18.
 */
var util = require('util');
var config = require('../config');
var mongoose = require('mongoose');
var BaseModel = require("./base_model");
//let Sequence = require('./sequence')

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Sequence = require('./sequence').Sequence


var ProfitSchema = mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  parentId: Number,
  //subId: Number,
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
  calcPRate: Number,
  profit: Number,
  status: String, //[start, mismatch, finished]
  symbol: String,
  amount: Number,
  sell_amount: Number,
  buy_amount: Number,
  extra: [],
});
ProfitSchema.plugin(BaseModel);
ProfitSchema.index({
  id: 1,
  parentId: 1,
  status: 1,
});


//在创建文档时，获取自增ID值
ProfitSchema.pre('save', function(next) {
  console.log('pre save in ')
  var self = this;
  if (self.isNew) {
    Sequence.increment('Profit', function(err, result) {
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

var Profit = mongoose.model('Profit', ProfitSchema);
