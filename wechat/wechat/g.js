/**
 * @file 中间件生成器函数
 */

'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(opts, handler) {

  // 初始化票据信息
  var wechat = new Wechat(opts)

  return async function (ctx, next) {

//====================== 微信服务端校验开始 ======================
    var token = opts.token
    var signature = ctx.query.signature
    var nonce = ctx.query.nonce
    var timestamp = ctx.query.timestamp
    var echostr = ctx.query.echostr

    // 字典排序
    var str = [token, timestamp, nonce].sort().join('')

    var sha = sha1(str)

    if (ctx.method === 'GET') {

      if (sha === signature) {
        ctx.body = echostr + ''
      } else {
        ctx.body = 'wrong'
      }

    } else if (ctx.method === 'POST') {
      
      if (sha !== signature) {
        ctx.body = 'wrong'
        return false
      }

 //====================== 校验通过，解析微信端返回数据 ===============   

      // 将返回数据转换为 => buffer
      var data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })

      // 解析xml数据 => object
      var content = await util.parseXMLAsync(data)

      // 格式化数据 => key: value
      var message = util.formatMessage(content.xml)

      // 解析后结果绑定到ctx上
      ctx.weixin = message

      // 开始处理消息中的动作信息，返回需要回复的内容
      await handler(ctx, next)

      // 开始组装回复内容为xml
      wechat.reply(ctx)

    }
  }
}



