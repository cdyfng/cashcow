var redis  = require('./redis');
var _      = require('lodash');
var logger = require('./logger');

var get = function (key, callback) {
  var t = new Date();
  redis.get(key, function (err, data) {
    if (err) {
      return callback(err);
    }
    if (!data) {
      return callback();
    }
    data = JSON.parse(data);
    var duration = (new Date() - t);
    logger.debug('Cache', 'get', key, (duration + 'ms').green);
    callback(null, data);
  });
};

exports.get = get;

var promiseGet = function (key) {
  var t = new Date();
  return new Promise(function(resolve, reject) {
    // Depth.find(
    //   query, function(err, depths) {
    //     //console.log('proxy: ')
    //     resolve(depths)
    //   })

    redis.get(key, function (err, data) {
      if (err) {
        //return callback(err);
        resolve(null)
      }
      if (!data) {
        //return callback();
        resolve(null)
      }
      data = JSON.parse(data);
      var duration = (new Date() - t);
      if(duration>5)
        logger.debug('Cache', 'get', key, (duration + 'ms').green);
      //callback(null, data);
      resolve(data)
    });
  });
};

exports.promiseGet = promiseGet;

// time 参数可选，秒为单位
var set = function (key, value, time, callback) {
  var t = new Date();

  if (typeof time === 'function') {
    callback = time;
    time = null;
  }
  callback = callback || _.noop;
  value = JSON.stringify(value);

  if (!time) {
    redis.set(key, value, callback);
  } else {
    redis.setex(key, time, value, callback);
  }
  var duration = (new Date() - t);
  logger.debug("Cache", "set", key, (duration + 'ms').green);
};

exports.set = set;


var promiseSet = function (key, value, time, callback) {
  var t = new Date();
  return new Promise(function(resolve, reject) {
    if (typeof time === 'function') {
      callback = time;
      time = null;
    }
    callback = callback || _.noop;
    value = JSON.stringify(value);
    let fn = function(err, data){
      callback(err, data)
      if(err) {
        console.log('promiseSet error:', err)
        resolve(err)
      }else{
        //console.log('d: ', data)
        resolve(data)
      }
      var duration = (new Date() - t);
      logger.debug("Cache", "set", key, (duration + 'ms').green);
    }

    if (!time) {
      redis.set(key, value, fn);
    } else {
      redis.setex(key, time, value, fn);
    }
    // var duration = (new Date() - t);
    // logger.debug("Cache", "set", key, (duration + 'ms').green);
  });

};

exports.promiseSet = promiseSet;
