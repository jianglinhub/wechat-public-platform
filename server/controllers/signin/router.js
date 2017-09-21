/**
 * Created by yong.liu on 2015/9/18.
 */
"use strict";
const path                = require("path");
const router              = require("koa-router")();
const jwtUtil             = require(path.join(process.cwd(), "server/util/jwtUtil"));
const handler             = require(path.join(process.cwd(), "server/service/serverAdmin/handler"));

/**
 * 登录
 */
router.post("/api/signin", async function (ctx, next) {
    let _this = ctx;
    let reqData = _this.request.body;
    let conditions = {
        username: reqData.username,
        password: reqData.password
    };
    let _body;
    let admins = await handler.findAdminByParams(conditions);
    if (0 < admins.length) {
        _body = {
            status: 1
        }
    } else {
        _body = {
            status: 0,
            errorMessage: "用户名或密码错误"
        }
    }
    if (_body.status) {
        let token = jwtUtil.jwtSign({
            id: admins[0]._id || ""
        });
        _body.token = token;
        _this.session.token = token || "";
        _this.session.id = admins[0]._id.toString();
    }
    console.log(_body);
    _this.body = _body;
});

/**
 * 登出
 */
router.post("/api/logout",function (ctx, next){
    ctx.session = null;
    ctx.body = {
        status: 1
    };
});

module.exports = router;