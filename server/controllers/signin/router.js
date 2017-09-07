/**
 * Created by yong.liu on 2015/9/18.
 */
"use strict";
const path                = require("path");
const router              = require("koa-router")();
const jwtUtil             = require(path.join(process.cwd(), "server/util/jwtUtil"));
const pwdUtil             = require(path.join(process.cwd(), "server/util/pwdUtil"));
const config              = require(path.join(process.cwd(), "server/config"));
const handler             = require(path.join(process.cwd(), "server/service/serverAdmin/handler"));
const brandConfig         = require(path.join(process.cwd(), "server/brand.json"));

router.get("/api/config",function(ctx, next){
    let _this = ctx;
    _this.body = brandConfig[config.brand];
});

/**
 * 登录
 */
router.post("/api/signin",async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.body;
    let conditions = {
        username: reqData.userName
    };
    let _body;
    let admins = await handler.findAdminByUserNameAndPassword(conditions);
    if(0 < admins.length){
        if(admins[0].status == 1){
            reqData.password =  pwdUtil(reqData.password);
            if(admins[0].password == reqData.password){
                _body = {
                    status: 1
                }
            }else{
                _body = {
                    status: 0,
                    errorMessage: "用户名或密码错误"
                }
            }
        }else{
            _body = {
                status: 0,
                errorMessage: "该账户已被禁用，请联系管理员启用"
            }
        }
    }else{
        _body = {
            status: 0,
            errorMessage: "用户名或密码错误"
        }
    }
    if(_body.status){
        let token = jwtUtil.jwtSign({
            id: admins[0]._id || ""
        });
        _this.session.token = token || "";
        _body.token = token;
        _this.session.id = admins[0]._id.toString();
        _this.session.roleIds = admins[0].adminRoles;
        _this.session.orgId = admins[0].org;
        _this.cookies.set("userName", reqData.userName, { httpOnly: false});
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