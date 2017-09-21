/**
 * Created by ly on 15-6-29.
 */
"use strict";
const path        = require("path");
const config      = require(path.join(process.cwd(), "server/config"));
const log         = require("../log/boleLog").boleLog;
const mongoose    = require("mongoose");

mongoose.Promise = require('bluebird');

module.exports = function(){
    let env = process.env.NODE_ENV;
    let mongodb = false;
    if(config.mongodb.on){
        mongoose.connect("mongodb://"+config.mongodb.host+":"+config.mongodb.port+"/"+config.mongodb.schema,{
            useMongoClient: true,
            keepAlive:1,
            connectTimeoutMS:30000,
            socketTimeoutMS:30000,
            autoReconnect:true,
            poolSize:10
        });
        mongodb = mongoose.connection;
        mongodb.on('error', console.error.bind(console, 'connection error:'));
        mongodb.once('open', function (callback) {
            log.info("Mongodb open successful!");
        });
    }
    return mongodb;
}