/**
 * Created by cdyfng on 03/01/18.
 */

var util = require('util');
var config = require('../config');
var mongoose = require('mongoose');
var BaseModel = require("./base_model");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Sequence = require('./sequence').Sequence

var AssetSchema = mongoose.Schema({
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
  profit: Number,
  detail: {},
  total: {},
  delta: {},
  price: {},
  summary: {},
});
AssetSchema.plugin(BaseModel);
AssetSchema.index({
  id: 1,
  //exchange: 1,
});


//在创建文档时，获取自增ID值
AssetSchema.pre('save', function(next) {
  //console.log('pre save in ')
  var self = this;
  if (self.isNew) {
    Sequence.increment('Asset', function(err, result) {
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

mongoose.model('Asset', AssetSchema);
