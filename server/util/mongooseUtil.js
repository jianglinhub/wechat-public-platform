/**
 * Created by mx on 2016/12/1.
 */
"use strict";
function MongooseUtil(){
    if(!(this instanceof MongooseUtil)){
        return new MongooseUtil();
    }
}

/**
 * 将函数转换成String
 * @param fn 函数
 * @param params 函数里面包含的变量的键值对
 */
MongooseUtil.prototype.parseFun = function(fn,params){
    let name,
        fnStr = fn.toString();
    for(name in params){
        fnStr = fnStr.replace(new RegExp(name,"g"),"\"" + params[name] + "\"")
    }
    return fnStr;
};

module.exports = MongooseUtil;