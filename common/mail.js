var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config');
var util = require('util');
var logger = require('./logger');
var transporter = mailer.createTransport(smtpTransport(config.mail_opts));
var SITE_ROOT_URL = 'http://' + config.host;
var async = require('async')

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
var sendMail = function(data) {
  /*if (config.debug) {
    return;
  }*/

  // 重试5次
  async.retry({
    times: 5
  }, function(done) {
    transporter.sendMail(data, function(err) {
      if (err) {
        // 写为日志
        logger.error('send mail error', err, data);
        return done(err);
      }
      return done()
    });
  }, function(err) {
    if (err) {
      return logger.error('send mail finally error', err, data);
    }
    logger.info('send mail success', data)
  })
};
exports.sendMail = sendMail;


exports.sendMyMail = function(who, subj, content) {
  var from = util.format('cdyfng <%s>', config.mail_opts.auth.user);
  var to = who;
  var subject = subj;
  var html = '<p>' + content + '</p>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};
