/**
 * Created by mx on 2016/12/12.
 */
"use strict";
exports.adminStatusFilter = (val) => {
    let map = {
        "0": "禁用",
        "1": "可用"
    };
    return map[val] ? map[val] : "";
};

exports.roleStatusFilter = (val) => {
    let map = {
        "0": "禁用",
        "1": "可用"
    };
    return map[val] ? map[val] : "";
};

exports.adminRoleFilter = (roles) => {
    let result = [];
    $.each(roles , (index , item ) => {
        result.push(item.name);
    });
    return result.join(",");
};

exports.readStateFilter = (val) => {
    let map = ["未读","已读"];
    return map[val] ? map[val] : "";
};

exports.DateFilter = (value) =>{
    let d = new Date(parseInt(value));
    if(d){
        let date = {
            "Y": d.getFullYear(),
            "M": d.getMonth()>8?(d.getMonth()+1):'0'+(d.getMonth()+1),
            "D": d.getDate()>9?d.getDate():'0'+d.getDate(),
            "h": d.getHours()>9?d.getHours():'0'+d.getHours(),
            "m": d.getMinutes()>9?d.getMinutes():'0'+d.getMinutes(),
            "s": d.getSeconds()>9?d.getSeconds():'0'+d.getSeconds()
        };
        let t = date['Y']+'-'+date['M']+'-'+date['D']+' '+date['h']+':'+date['m']+':'+date['s'];
        return t;
    }else{
        return "";
    }

};