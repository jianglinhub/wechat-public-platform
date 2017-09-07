/**
 * Created by caan on 2017/4/28.
 */
const crypto = require('crypto');

module.exports = function (pwd){
    let hmac = crypto.createHmac('sha256', 'Meiauto$');
    hmac.update(pwd);
    let newPwd = hmac.digest('base64');
    return newPwd;
};