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
            create_time: String,
            update_time:String,
            source: String,
            content: String,
            create_admin: {
                type: Schema.Types.ObjectId,
                ref: "admin"
            }
        });
        return mongoose.model("article", articleSchema);
    }
}

module.exports = new Article;