var config = require('../config');
require('ansicolor').nice;

var env = process.env.NODE_ENV || "development"


var log4js = require('log4js');
log4js.configure({
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'file',
      filename: '/root/work/cashcow/logs/cashcow.log',
      category: 'cashcow'
    }
  ]
});

var logger = log4js.getLogger('cashcow');
logger.setLevel(config.debug && env !== 'test' ? 'DEBUG' : 'ERROR')

module.exports = logger;
