var EventProxy = require('eventproxy');
var models = require('../models');
var Global = models.Global;

exports.getGlobals = function(query, callback) {
  var proxy = new EventProxy();
  var events = ['globals'];
  proxy.assign(events, function(globals) {
    if (!globals) {
      return callback(null);
    }
    return callback(globals);
  }).fail(callback);

  console.log('query:', query)
  Global.find(
    query
    , proxy.done(function(globals) {
      if (!globals) {
        proxy.emit('globals', null);
        return;
      }
      proxy.emit('globals', globals);
    }));
};

exports.newAndSave = function(global, callback) {
  var global = new Global(global);
  global.save(callback);
};


exports.Edit = function(global, callback) {
  global.save(callback);
};
