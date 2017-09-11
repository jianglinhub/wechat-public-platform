/**
 * @file access_token本地存储操作
 *
 * 1. 读取本地access_token
 * 2. 写入本地access_token
 */

'use strict'

var fs = require('fs')

/**
 * 读取本地access_token
 *
 * @param {string} fpath access_token文件路径
 * @param {string} encoding 编码格式
 */
exports.readFileAsync = function(fpath, encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

/**
 * 写入本地access_token
 *
 * @param {string} fpath access_token文件路径
 * @param {string} content access_token内容
 */
exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}