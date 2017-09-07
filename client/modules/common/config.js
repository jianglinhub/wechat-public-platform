/**
 * Created by yong.liu on 2016/11/10.
 */
"use strict";

function Config(){}

Config.prototype.constructor = Config;

Config.prototype.getConfig = function(callback){
    if(typeof XMLHttpRequest === "undefined"){
        return callback(new Error("No browser support"));
    }
    let request;
    let requestPath = "config";
    try {
        request = new XMLHttpRequest();
        request.open("GET", requestPath, false);
        request.timeout = 60000;
        request.send();
    } catch(err) {
        return callback(err);
    }
    request.onreadystatechange = function(){
        if(request.readyState != 4){
            return;
        }
        if(request.status !== 200 && request.status !== 304) {
            callback(new Error("Config request to " + requestPath + " failed."));
        }else{
            try{
                callback(null, JSON.parse(request.responseText));
            }catch(e){
                callback(e);
                return;
            }
        }
    }
}

/*window.boot = {
    config: {}
}

let config = new Config();

config.getConfig(function(err, configs){
    window.boot.config = configs
});*/

let config = new Config;

export { config }
