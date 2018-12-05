/**
  * 存储ID的序列值
  */
//var logger = require('../common/logger');
var util = require('util');
var config = require('../config');
var mongoose = require('mongoose');
var BaseModel = require("./base_model");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


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

let Sequence = mongoose.model('Sequence', SequenceSchema);
exports.Sequence = Sequence
