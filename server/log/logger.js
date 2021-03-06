/**
 * Created by ly on 15-7-3.
 */
var koaLogger       = require('koa-logger2');
var koaJsonLogger   = require("koa-json-logger");
var path            = require('path');
var fs              = require('fs');
var config          = require("../config");
var mkdir           = require("../util/mkdir");

var logger;

var log_middleware = koaLogger('ip [year/month/day time zone] "method url protocol/httpVer" status size "referer" "userAgent" duration ms custom[unpacked]');
var logpath = config.log.path;
if(logpath){
    mkdir.sync(logpath);
    logpath += config.log.name;
    log_middleware.setStream(fs.createWriteStream(logpath, { flags: 'a' }));
}else{
    log_middleware.setStream(process.stdout);
}
logger = log_middleware.gen;

/*logger = koaJsonLogger({
    name: 'user-portal',
    path: 'log',
    jsonapi: false
});*/

module.exports = logger;