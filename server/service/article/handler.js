/**
 * Created by yong.liu on 2016/9/10.
 */
"use strict";
const path            = require("path");
const articleModel    = require(path.join(process.cwd(), "server/models/article/article")).articleModel;
const mongoose        = require('mongoose');

class Service{
    constructor(){

    }

    static searchParamsClearEmptyValue(params) {
        for (let key in params) {
            if (!params[key]) {
                delete params[key]
            }
        }
    }

    //通过id更新文章
    updateArticleById(id, changeObj) {
        return articleModel.update({_id: id}, {$set: changeObj}).exec();
    }

    //保存文章
    saveArticle(param) {
        let article = new articleModel(param);
        return article.save();
    }

    //通过id删除文章
    deleteArticleById(id) {
        return articleModel.remove({_id: id}).exec();
    }

    //通过条件查找文章,支持 标题模糊搜索 和 时间区间 并分页
    findArticlesByParamsAndPageHasFuzzy(params, pager) {
        if (params.title) {
            let pattern = new RegExp(params.title);
            params.title = {$regex: pattern, $options: 'imxs'};
        }
        // params.create_time = {
        //     "$gte":params.startTime || 0,
        //     "$lte":params.endTime || new Date().getTime()
        // };
        // delete params.startTime;
        // delete params.endTime;
        Service.searchParamsClearEmptyValue(params);
        return Promise.all([
            articleModel.find(params).count().exec(),
            articleModel.find(params).sort({update_time: -1}).populate({
                path: "create_admin",
                select: "username"
            }).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
        ])
    }

    findArticleById(id){
        return articleModel.findOne({_id: id}).exec();
    }
}

module.exports = new Service;

