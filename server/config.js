/**
 * Created by yong.liu on 2015/6/11.
 */
'use strict';
const fs          = require('fs');
const _           = require('underscore');

let nodeEnv = process.env.NODE_ENV || 'development';
let pkgConfig = JSON.parse(fs.readFileSync('package.json'));
let config = {
    pkg: {},
    session: process.env.SESSION
};
_.extend(config.pkg, pkgConfig);
let configPath;
try{
    if(nodeEnv == 'development'){
        configPath = 'server/config.json';
    }else{
        configPath = fs.realpathSync('/ice/config/config.json');
    }
}catch (err){
    throw new Error("配置文件:/ice/config/config.json,不存在！");
}
let baseConfigFs = JSON.parse(fs.readFileSync(configPath));
_.extend(config, baseConfigFs[nodeEnv]);

module.exports = config;