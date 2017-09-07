/**
 * Created by MXH on 2015/11/12.
 */
var querystring = require("querystring");
var config      = require(path.join(process.cwd(), "server/config"));
var log         = require(path.join(process.cwd(), "server/log/boleLog")).boleLog;

var joinUrl = function(service,methodName,reqBody){
    var url = config[service]["baseUrl"] + (methodName ? methodName : ""),
        queryStr = querystring.stringify(reqBody);
    return url + (queryStr ? "?" + queryStr : "");
};

module.exports = joinUrl;
