/**
 * @file 回复消息
 */

'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

exports.reply = async function (ctx, next) {
  var message = ctx.weixin

  var reply = ''

  if (message.MsgType === 'event') {

    if (message.Event === 'subscribe') {

      reply = '欢迎关注镁奥途，回复关键字可直接查询历史信息！\r\n'

    } else if (message.Event === 'unsubscribe') {

      console.log('取消关注')
      reply = ''

    }

  } else if (message.MsgType === 'text') {
    var content = message.Content

    // 查询关键字
    var articles = await wechatApi.queryArticlesByKeyword(content)

    if (!articles.datas || articles.datas.length === 0) {
      reply = '额，没有找到“' + message.Content + '”相关内容，换个关键字试试？'
    } else {

      articles = articles.datas.slice(0, 10)

      console.log(articles)

      var news = []
      articles.forEach(function(article) {
        news.push({
          title: article.title,
          description: article.digest,
          picUrl: article.poster_url,
          url: article.source_url
        })
      })

      reply = news

    }

  }

  ctx.reply = reply

}