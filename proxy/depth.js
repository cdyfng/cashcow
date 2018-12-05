var EventProxy = require('eventproxy');
var models = require('../models');
const log = require('ololog').configure({
  locate: false
})

var Depth = models.Depth;


exports.GetLastestDepths = async function(query) {
  return new Promise(function(resolve, reject) {
    Depth.find(
      query, function(err, depths) {
        //console.log('proxy: ')
        resolve(depths)
      }).sort({
      create_at: -1
    }).limit(1)
  });

}

exports.GetDepths = async function(query) {
  return new Promise(function(resolve, reject) {
    Depth.find(
      query, function(err, depths) {
        //console.log('proxy: ')
        resolve(depths)
      })
  });

}

exports.NewDepth = function(depth_plain) {
  return new Promise(function(resolve, reject) {
    var depth = new Depth(depth_plain);
    depth.save(function(err, depth_out) {
      if (err) log.bright.red('promiseNewAndSave err:', err)
      resolve(depth_out)
    })
  });
};
