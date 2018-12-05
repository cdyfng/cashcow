var mongoose = require('mongoose');
var config = require('../config');
//var logger = require('../common/logger')

mongoose.connect(config.db, {
  server: {
    poolSize: 20
  }
}, function(err) {
  if (err) {
    //logger.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

// models
require('./order');
require('./global');
require('./depth')
require('./asset')
require('./profit')


exports.Order = mongoose.model('Order');
exports.Global = mongoose.model('Global');
exports.Depth = mongoose.model('Depth');
exports.Asset = mongoose.model('Asset');
exports.Profit = mongoose.model('Profit');
