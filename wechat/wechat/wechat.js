/**
 * @file 定义微信相关操作方法
 * 1. 全局票据access_token管理验证
 * 2. 相关数据交互接口定义
 */

'use strict'

var req = require('request')
var request = require('request-promise')
var util = require('./util')
var fs = require('fs')
var _ = require('lodash')

var prefix = 'https://api.weixin.qq.com/cgi-bin/'

var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?',
    fetch: prefix + 'media/get?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    fetch: prefix + 'material/get_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    del: prefix + 'material/del_material?',
    update: prefix + 'material/update_news?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  }

}

// 票据
function Wechat(opts) {
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.fetchAccessToken()

}

/**
 * 请求access_token
 */
Wechat.prototype.fetchAccessToken = function(data) {

  var that = this

  // 判断缓存里面access_token是否存在
  if (this.access_token && this.expires_in) {

    // 校验access_token是否过期
    if (this.isValidAccessToken(this)) {

      // 将Wechat对象以Promise形式传递出去
      return Promise.resolve(this)
    }

  }

  // 重新请求本地存储的access_token
  this.getAccessToken()
    .then(function(data) {

      try {
        data = JSON.parse(data)
      } catch(e) {

        // 有异常则重新请求微信服务端的access_token
        return that.updateAccessToken(data)
      }

      if (that.isValidAccessToken(data)) {
        return Promise.resolve(data)
      } else {
        return that.updateAccessToken()
      }

    }).then(function(data) {
      that.access_token = data.access_token
      that.expires_in = data.expires_in

      that.saveAccessToken(data)

      return Promise.resolve(data)
    })
}

/** 
 * 校验是否过期
 */
Wechat.prototype.isValidAccessToken = function(data) {
  
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }

  // var access_token = data.access_token
  var expires_in = data.expires_in
  var now = (new Date().getTime())

  if (now < expires_in) {
    return true
  } else {
    return false
  }

}

/**
 * 请求微信服务端获取access_token
 */
Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

  return new Promise(function(resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function(data) {
      var now = (new Date().getTime())

      // 票据过期时间为2小时，提前20秒时间获取新票据
      var expires_in = now + (data.expires_in - 20) * 1000

      data.expires_in = expires_in

      resolve(data)

    })
  })
}

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
  var that = this
  var form = {}
  var uploadUrl = api.temporary.upload

  if (permanent) {
    uploadUrl = api.permanent.upload

    _.extend(form, permanent)
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic
  }

  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews
    form = material
  } else {
    form.media = fs.createReadStream(material)
  }

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = uploadUrl + '&access_token=' + data.access_token

        if (!permanent) {
          url += '&type=' + type
        }

        var options = {
          method: 'POST',
          url: url,
          json: true
        }

        if (type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }

        request(options)
          .then(function(response) {
            var _data = response
        
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('Upload material failed')
            }

          }).catch(function(err) {
            reject(err)
          })
      })
  })
}


Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
  var that = this
  var fetchUrl = api.temporary.fetch

  if (permanent) {
    fetchUrl = api.permanent.fetch
  }

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = fetchUrl + '&access_token=' + data.access_token
        var form = {}
        var options = { method: 'POST', url: url, json: true }

        if (permanent) {
          form.media_id = mediaId
          options.body = form
        } else {
          
          if (type === 'video') {
            url = url.replace('https://', 'http://')
          }

          url += '&media_id=' + mediaId
        }

        if (type === 'news' || type === 'video') {

          request(options)
            .then(function(response) {
              var _data = response
          
              if (_data) {
                resolve(_data)
              } else {
                throw new Error('Fetch material failed')
              }

            }).catch(function(err) {
              reject(err)
            })

        } else {
          resolve(url)
        }

        

      })
  })
}

Wechat.prototype.deleteMaterial = function(mediaId) {
  var that = this
  var form = {
    media_id: mediaId
  }

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.del + '&access_token=' + data.access_token +
          '&media_id=' + mediaId

        var options = {
          method: 'POST',
          url: url,
          body: form,
          json: true
        }
         
        request(options)
          .then(function(response) {
            var _data = response
        
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('Delete material failed')
            }

          }).catch(function(err) {
            reject(err)
          })

      })
  })
}

Wechat.prototype.updateMaterial = function(mediaId, news) {
  var that = this
  var form = {
    media_id: mediaId
  }

  _.extend(form, news)

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.update + '&access_token=' + data.access_token +
          '&media_id=' + mediaId

        var options = {
          method: 'POST',
          url: url,
          body: form,
          json: true
        }
         
        request(options)
          .then(function(response) {
            var _data = response
        
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('Update material failed')
            }

          }).catch(function(err) {
            reject(err)
          })

      })
  })
}


Wechat.prototype.countMaterial = function() {
  var that = this

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.count + '&access_token=' + data.access_token

        var options = {
          method: 'GET',
          url: url,
          json: true
        }
         
        request(options)
          .then(function(response) {
            var _data = response
        
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('Delete material failed')
            }

          }).catch(function(err) {
            reject(err)
          })

      })
  })
}

Wechat.prototype.batchMaterial = function(options) {
  var that = this

  options.type = options.type || 'image'
  options.offset = options.offset || 0
  options.count = options.count || 1

  return new Promise(function(resolve, reject) {

    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.batch + '&access_token=' + data.access_token

        var options = {
          method: 'GET',
          url: url,
          body: options,
          json: true
        }
         
        request(options)
          .then(function(response) {
            var _data = response
        
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('Batch material failed')
            }

          }).catch(function(err) {
            reject(err)
          })

      })
  })
}

// 组装回复内容为xml
Wechat.prototype.reply = function(ctx) {
  var content = ctx.reply
  var message = ctx.weixin

  // 开始组装模版消息
  var xml = util.tpl(content, message)

  ctx.status = 200
  ctx.type = 'application/xml'
  ctx.body = xml
}

module.exports = Wechat
