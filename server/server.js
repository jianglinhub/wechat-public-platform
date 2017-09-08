/**
 * Created by yong.liu on 2015/6/11.
 */
'use strict';
const http    = require("http");
const cluster = require("cluster");
const log     = require("./log/boleLog").boleLog;
const app     = require("./index");
const config  = require("./config");

function errorMsg() {
    //cluster.fork();
    log.info("Something must be wrong with the connection ...");
}

function startWork(){
    let worker = cluster.fork();
    log.info('CLUSTER: Worker %d started', worker.id);
}

let timeouts = [];
if(cluster.isMaster && config.cluster){
    let numCPUs = require('os').cpus().length
    for(let i = 0; i<numCPUs; i++){
        let worker = cluster.fork();
        worker.on('message', function(message){
            log.info(message.from + ': ' + message.type + ' ' + message.data.number + ' = ' + message.data.result);
        });
    }
    cluster.on('online', function(worker) {
        log.info('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('fork', function(worker) {
        timeouts[worker.id] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', function(worker, address) {
        log.info("A worker #" + worker.id + " is now connected to " + address.address + ":" + address.port);
        clearTimeout(timeouts[worker.id]);
    });
    cluster.on('exit', function(worker, code, signal) {
        clearTimeout(timeouts[worker.id]);
        startWork();
    });
    cluster.on('disconnect', function(worker) {
        log.info('The worker #' + worker.id + ' has disconnected');
    });
}else{
    http.createServer(app.callback()).listen(config.port);
    log.info(config.pkg.name + " is listening on http://" + config.ip + ":" + config.port);
}