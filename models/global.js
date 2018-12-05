/**
 * Created by cdyfng on 20/10/17.
 */
var mongoose = require('mongoose');
var BaseModel = require("./base_model");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GlobalSchema = mongoose.Schema({
  id: Number,
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  },
  transactions: {
    type: Number,
    default: 0
  },
  eth_buy_amount: {
    type: Number,
    default: 0
  },
  eth_sell_amount: {
    type: Number,
    default: 0
  },
  bch_buy_amount: {
    type: Number,
    default: 0
  },
  bch_sell_amount: {
    type: Number,
    default: 0
  },
  balance: {},
  extra: {},
  debug: {type: Boolean, default: false},
  statisticId: Number,
  setting: {},
  offer_price_types: {},
  all_ex: {},
  assets_symbols: {},
  symbols: {},


});
GlobalSchema.plugin(BaseModel);
GlobalSchema.index({
  create_at: -1,
});

mongoose.model('Global', GlobalSchema);
