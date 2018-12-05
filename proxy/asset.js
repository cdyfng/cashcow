var EventProxy = require('eventproxy');
var models = require('../models');
const log = require('ololog').configure({
  locate: false
})

var Asset = models.Asset;


exports.GetLastestAssets = async function(query) {
  return new Promise(function(resolve, reject) {
    Asset.find(
      query, function(err, assets) {
        //console.log('proxy: ')
        if(assets.length>=1)
          resolve(assets[0])
        else
          resolve(null)

      }).sort({
      id: -1
    }).limit(1)
  });

}

exports.GetAssets = async function(query) {
  return new Promise(function(resolve, reject) {
    Asset.find(
      query, function(err, assets) {
        //console.log('proxy: ')
        resolve(assets)
      })
  });

}

exports.NewAsset = function(asset_plain) {
  return new Promise(function(resolve, reject) {
    var asset = new Asset(asset_plain);
    asset.save(function(err, asset_out) {
      if (err) log.bright.red('promiseNewAndSave err:', err)
      resolve(asset_out)
    })
  });
};
