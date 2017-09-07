/**
 * Created by yong.liu on 2016/9/8.
 */
"use strict";
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

class Article{
    constructor(){

    }

    get articleModel(){
        let articleSchema = Schema({
            title: String,
            create_time: String, //唯一，不能重复
            source: String,
            content: String, //文章
            adminRoles: [{
                type: Schema.Types.ObjectId,
                ref: "adminRole"
            }]
        });
        return mongoose.model("article", articleSchema);
    }
}

module.exports = new Article;