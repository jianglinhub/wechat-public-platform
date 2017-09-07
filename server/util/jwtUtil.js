/**
 * Created by ly on 2016/6/2.
 */
var fs      = require('fs');
var path    = require('path');
var assert  = require('assert');
var jwt     = require('jsonwebtoken');
var _       = require('underscore');
var log     = require("../log/boleLog").boleLog;

/**
 * 加密
 * @param signObj
 * @returns {*}
 */
function jwtSign(signObj){
    if(signObj == null){
        signObj = {};
    }
    var token;
    var SECRET_KEY = getPrivateKey();
    assert(_.isObject(signObj), 'the signObj must be a Object!');
    assert(!_.isArray(signObj), 'signObj not allowed a Array!');
    token = jwt.sign(signObj, SECRET_KEY, {
        algorithm: 'RS256',
        expiresIn: '1d'
    });
    return token;
}

/**
 * 解密
 * @param token
 */
function jwtDecode(token){
    return jwt.decode(token, {complete: true}).payload;
}

/**
 * 获取公钥
 */
function getPublicKey(){
    return fs.readFileSync(path.join(process.cwd(), '/server/util/rsa_public_key.pem'));
}

/**
 * 获取公钥
 */
function getPrivateKey(){
    return fs.readFileSync(path.join(process.cwd(), '/server/util/rsa_private_key.pem'));
}

module.exports = {
    jwtSign: jwtSign,
    jwtDecode: jwtDecode,
    getPublicKey: getPublicKey
};