/**
 * @file 秘钥相关配置
 * 
 * 1. 交互秘钥
 * 2. access_token本地存储
 */

'use strict'

var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var wechat_config = require('../server/config').wechat

var config = {
  wechat: {
    appID: wechat_config.appID,
    appSecret: wechat_config.appSecret,
    token: wechat_config.token,
    getAccessToken: function() {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}

module.exports = config