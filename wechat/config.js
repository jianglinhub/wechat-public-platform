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

var config = {
  wechat: {
    appID: 'wxd5c0bf6d780dc567',
    appSecret: 'bc4dfad156482fc05f6932c7cf519877',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX',
    // appID: 'wx573682f292e62c19',
    // appSecret: 'c541ce41d35de79bd72a048459c131bb',
    // token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX',
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