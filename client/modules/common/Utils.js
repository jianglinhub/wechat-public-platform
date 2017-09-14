/**
 * Created by yong.liu on 2016/10/22.
 */
"use strict";

function Utils(){

}

Utils.prototype.constructor = Utils;

Utils.prototype.getCookie = function(c_name){
    if (document.cookie.length > 0){
        let c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1){
            c_start = c_start + c_name.length + 1;
            let c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length
            return decodeURIComponent(document.cookie.substring(c_start, c_end));
        }
    }
    return ""
}

Utils.prototype.setCookie = function(val){
    let d = new Date();
    d.setTime(d.getTime() + (1*24*60*60*1000));
    let expires = "expires="+d.toUTCString();
    let cookieStr = val.name + "=" + val.value + "; ";
    document.cookie = cookieStr + expires;
}

Utils.prototype.Format = function(_date, fmt) {
    let date = new Date(Number(_date));
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

let NUtil = new Utils;

export { NUtil };