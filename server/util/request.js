/**
 * Created by ly on 15-7-10.
 */
"use strict";
const req       = require('request');
const request   = require('request-promise');
const log       = require("../log/boleLog").boleLog;
const errorUtil = require("./errorUtil");

function Request(){}

Request.prototype.constructor = Request;

/**
 * 发送请求
 * @param options
 * @returns {*}
 */
Request.prototype.transfer = function  (options){
    let param = {
        uri: options.uri,
        method: options.method,
        form: options.params,
        formData: options.formData,
        body: options.body,
        json: true
    };
    log.info(param);
    return request(param);
}

Request.prototype.transferFile = function  (options){
    let param = {
        uri: options.uri,
        method: options.method,
        formData: options.formData,
        headers:{
            'transfer-encoding':'chunked'
        },
        json: true
    };
    log.info(param);
    return new Promise((resolve, reject) => {
        req(param,function (error, response, body) {
            if (error) {
                reject(error);
            }
            resolve(body);
        });
    });
}



module.exports = new Request;