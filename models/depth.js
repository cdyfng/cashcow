/**
 * Created by cdyfng on 06/11/17.
 */
//var logger = require('../common/logger');
var util = require('util');
var config = require('../config');
var mongoose = require('mongoose');
var BaseModel = require("./base_model");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Sequence = require('./sequence').Sequence

var DepthSchema = mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  },
  website_time: {
    type: Date,
    default: Date.now
  },
  exchange: String,
  symbol: String,
  ask0: [Number],
  ask_amount0: Number,
  bid0: [Number],
  bid_amount0: Number,
});
DepthSchema.plugin(BaseModel);
DepthSchema.index({
  create_at: 1,
  //id: 1,
  //exchange: 1,
  //symbol: 1
});


//在创建文档时，获取自增ID值
/*
DepthSchema.pre('save', function(next) {
  //console.log('pre save in ')
  var self = this;
  if (self.isNew) {
    Sequence.increment('Depth', function(err, result) {
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
*/
mongoose.model('Depth', DepthSchema);
