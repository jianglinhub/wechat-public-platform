/**
 * Created by yong.liu on 2016/9/21.
 */
"use strict";
const path    = require("path");
const trouter = require(path.join(process.cwd(), "server/middleware/trouter"));
const handler = require(path.join(process.cwd(), "server/service/article/handler"));

//新增文章
trouter.post("/articles", async function (ctx, next) {
    let reqData = ctx.request.body;
    let time =new Date().getTime();
    let param = {
        title: reqData.title,
        source: reqData.source,
        content: reqData.content,
        create_time : time,
        update_time : time,
        create_admin : ctx.session.id
    };
    await handler.saveArticle(param);
    ctx.body = {
        status: 1
    };
});

//修改文章
trouter.put("/articles", async function (ctx, next) {
    let reqData = ctx.request.body;
    let param = {
        title: reqData.title,
        source: reqData.source,
        content: reqData.content,
        update_time : new Date().getTime()
    };
    await handler.updateArticleById(ctx.query.id, param);
    ctx.body = {
        status: 1
    };
});

//删除文章
trouter.delete("/articles", async function (ctx, next) {
    await handler.deleteArticleById(ctx.query.id);
    ctx.body = {
        status:1
    };
});

//分页查询文章
trouter.get("/articles", async function (ctx, next) {
    let reqData = ctx.query;
    let pageIndex = parseInt(reqData.pageIndex);
    let pageSize = parseInt(reqData.pageSize);
    let query = {
        title:reqData.title,
        startTime:reqData.startTime,
        endTime:reqData.endTime
    };
    let result = await handler.findArticlesByParamsAndPageHasFuzzy(query, {
        pageIndex: pageIndex,
        pageSize: pageSize
    });
    let total = result[0];
    let articles = result[1];
    ctx.body = {
        status: 1,
        datas: articles,
        pageCount: Math.ceil(total / pageSize),
        pageSize: pageSize,
        pageIndex: pageIndex,
        totalCount: total
    };
});

//查询某个文章
trouter.get("/article", async function (ctx, next) {
    let res = await handler.findArticleById(ctx.query.id);
    ctx.body = {
        data:res,
        status:1
    };
});

module.exports = trouter;