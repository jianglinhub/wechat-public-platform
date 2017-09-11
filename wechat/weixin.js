/**
 * @file 回复消息
 */

'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

exports.reply = async function (ctx, next) {
  var message = ctx.weixin

  var reply = '额，你说的 ' + message.Content + ' 太复杂了'

  if (message.MsgType === 'event') {

    if (message.Event === 'subscribe') {

      if (message.EventKey) {
        console.log('扫描二维码进来：' + message.EventKey + ' ' + 
          message.ticket)
      }

      reply = '你订阅了这个号\r\n'

    } else if (message.Event === 'unsubscribe') {

      console.log('取消关注')
      reply = ''

    } else if (message.Event === 'LOCATION') {
      
      reply = '您上报的位置是：' + message.Latitude + '/' + 
        message.Longitude + '-' + message.Precision

    } else if (message.Event === 'CLICk') {

      reply = '您点击了菜单：' + message.EventKey

    } else if (message.EventKey === 'SCAN') {
      
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket)

      reply = '扫了一下'

    } else if (message.Event === 'VIEW') {

      reply = '您点击了菜单中的连接：' + message.EventKey

    }

  } else if (message.MsgType === 'text') {

    var content = message.Content

    if (content === '1') {

      reply = '天下第一吃大米'

    } else if (content === '2') {

      reply = '天下第二吃豆腐'

    } else if (content === '3') {

      reply = '天下第三吃仙丹'

    } else if (content === '4') {

      reply = [{
        title: '技术改变世界',
        description: '只是个描述',
        picUrl: 'http://szimg.mukewang.com/596d796300013ccf05400300-360-202.jpg',
        url: 'https://github.com/'
      }]

    } else if (content === '5') {

      var data = await wechatApi.uploadMaterial('image', __dirname + 
        '/2.jpg')

      reply = {
        type: 'image',
        mediaId: data.media_id
      }

    } else if (content === '6') {

      var data = await wechatApi.uploadMaterial('video', __dirname + 
        '/6.mp4')

      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '回复个视频试试',
        mediaId: data.media_id
      }

    } else if (content === '7') {

      var data = await wechatApi.uploadMaterial('image', __dirname + 
        '/2.jpg')

      reply = {
        type: 'music',
        title: '回复音乐内容',
        description: '回复个音乐试试',
        musicUrl: 'http://abc.mp3',
        thumbMediaId: data.media_id
      }

    } else if (content === '8') {

      var data = await wechatApi.uploadMaterial('image', __dirname + 
        '/2.jpg', {type: 'image'})

      reply = {
        type: 'image',
        mediaId: data.media_id
      }

    } else if (content === '9') {
      
      var data = await wechatApi.uploadMaterial('video', __dirname + 
        '/6.mp4', {type: 'video', description: '{"title": "Really a nice place", "introduction": "ctx is a introduction for video"}'})

      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '回复个视频试试',
        mediaId: data.media_id
      }

    } else if (content === '10') {

      var picData = await wechatApi.uploadMaterial('image', __dirname + 
        '/2.jpg', {})

      console.log('picData:', picData)

      var media = {
        articles: [{
          title: 'tututu2',
          thumb_media_id: picData.media_id,
          author: 'jiang lin',
          digest: '无摘要',
          show_cover_pic: 1,
          content: '无内容',
          content_source_url: 'https://github.com'
        }]
      }

      data = await wechatApi.uploadMaterial('news', media, {})
      data = await wechatApi.fetchMaterial(data.media_id, 'news', {})

      console.log(data)

      var items = data.news_item
      var news = []

      items.forEach(function(item) {
        news.push({
          title: item.title,
          description: item.digest,
          picUrl: picData.url,
          url: item.url
        })
      })

      reply = news

    } else if (content === '11') {
      var counts = await wechatApi.countMaterial()

      console.log(counts)

      var results= await [
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'image'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'video'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'voice'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'news'
        })
      ]

      console.log(results)

      reply = '1'
    }

  }

  ctx.reply = reply

}