/**
 * Created by yong.liu on 2016/9/8.
 */
"use strict";
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

class Admin{
    constructor(){

    }

    get adminModel(){
        let adminSchema = Schema({
            password: String, //密码
            username: String, //用户名，不能重复
        });
        return mongoose.model("admin", adminSchema);
    }
}

module.exports = new Admin;