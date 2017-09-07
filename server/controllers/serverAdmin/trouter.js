/**
 * Created by yong.liu on 2016/9/21.
 */
"use strict";
const path    = require("path");
const trouter = require(path.join(process.cwd(), "server/middleware/trouter"));
const jwtUtil = require(path.join(process.cwd(), "server/util/jwtUtil"));
const handler = require(path.join(process.cwd(), "server/service/serverAdmin/handler"));
const _ = require("underscore");

trouter.get("/findAdminByToken", async function (ctx, next){
    let _this = ctx;
    let token = _this.request.query.token;
    let tokenObj = jwtUtil.jwtDecode(token);
    let id = tokenObj.id ? tokenObj.id : tokenObj.userName;
    let admin = await handler.findAdminById(id);
    console.log(admin);
    let _body = {
        status: 1,
        admin: admin
    };
    _this.body = _body;
});

trouter.get("/findAdminRole", async function (ctx, next) {
    let _this = ctx;
    let adminRoles = await handler.findAdminRole();
    let _body = {
        status: 1,
        adminRoles: adminRoles
    }
    _this.body = _body;
});

trouter.get("/findAdminByUserNameAndRoleId", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let total = await handler.countAdminByCondition(reqData);
    let admins = await handler.findAdminByConditionAndPage(reqData , {pageIndex: parseInt(reqData.pageIndex) , pageSize: parseInt(reqData.pageSize)});
    let _body = {
        status: 1,
        admins: admins,
        pageCount: Math.ceil(total / parseInt(reqData.pageSize)),
        pageSize: parseInt(reqData.pageSize),
        pageIndex: parseInt(reqData.pageIndex),
        totalCount: total
    };
    _this.body = _body;
});

trouter.get("/findAdminByUsername", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let admins = await handler.findAdminByUserNameAndPassword(reqData);
    let _body = {
        status: 1,
        admins: admins
    }
    _this.body = _body;
});

trouter.get("/fuzzyFindAdminByUserName", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let username = reqData.username;
    let admins = await handler.fuzzyFindAdminByUserName(username);
    let _body = {
        status: 1,
        admins: admins
    }
    _this.body = _body;
});

trouter.post("/saveAdmin", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.body;
    reqData.status = 1;
    reqData.passStatus = 0;
    let result = await handler.saveAdmin(reqData);
    let _body = result._id ? {status:1} :{};
    _this.body = _body;
});

trouter.put("/admin",async function (ctx, next){
   let result = await handler.updateAdminById(ctx.request.query.id,ctx.request.body);
    ctx.body = result;
});

trouter.delete("/admin",async function (ctx, next){
    let total,
        result;
    if(ctx.session.id !== ctx.request.query.id){
        total = await handler.countAdminByCondition({});
        if(1 < total){
            result = await handler.deleteAdminById(ctx.request.query.id);
        }else{
            result = {
                status: "FAILED",
                errorMessage: "不能删除最后一个用户"
            }
        }
    }else{
        result = {
            status: "FAILED",
            errorMessage: "不能删除自己"
        }
    }
    ctx.body = result;
});

trouter.put("/adminReset",async function (ctx, next){
    let reqBody = ctx.request.body;
    let result = await handler.updateAdminById(reqBody.id,{password: reqBody.password});
    ctx.body = result.ok ? {status:1} : {};
});

trouter.get("/adminBySessionId",async function (ctx, next){
    let result = await handler.findAdminBySessionId(ctx.session.id);
    ctx.body = result;
});
//查找权限
// trouter.get("/findPermission", async function (ctx, next) {
//     let _this = ctx;
//     let id = _this.query.id;
//     let permissions = await handler.findPermission(id);
//     let _body = {
//         status: 1,
//         permissions: permissions
//     };
//     _this.body = _body;
// });

trouter.get("/findMenus", async function (ctx, next) {
    let _this = ctx;
    let menus = await handler.findMenus();
    let _body = {
        status: 1,
        menus: menus,
    };
    _this.body = _body;
});

trouter.get("/findMenusByResource", async function (ctx, next) {
    let _this = ctx;
    let roleIds = ctx.session.roleIds;
    let menus = await handler.findMenusByResource(roleIds);
    let _body = {
        status: 1,
        menus: menus,
        token: _this.session.token || "",
    }
    _this.body = _body;
});

trouter.post("/addLevel0Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.addLevel0Menu(_this.request.body);
    let _body={};
    if(result){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

trouter.put("/updateLevel0Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.updateLevel0Menu(_this.request.body,_this.query.id);
    let _body={};
    if(result.ok){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

trouter.delete("/delLevel0Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.delLevel0Menu(_this.query.id);
    let _body={};
    if(result.ok){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

//二级菜单增
trouter.put("/addLevel1Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.addLevel1Menu(_this.request.body,_this.query.id);
    let _body={};
    if(result.ok){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

//二级菜单改
trouter.put("/editLevel1Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.editLevel1Menu(_this.request.body,_this.query.parentId,_this.query.subIndex);
    let _body={};
    if(result.ok){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

//二级菜单删
trouter.put("/delLevel1Menu", async function (ctx, next) {
    let _this = ctx;
    let result = await handler.delLevel1Menu(_this.query.parentId,_this.query.subIndex);
    let _body={};
    if(result.ok){
        _body = {
            status: 1
        }
    }
    _this.body = _body;
});

trouter.get("/findSubMenus", async function (ctx, next) {
    let _this = ctx;
    let parent = await handler.findSubMenus(_this.query.id);
    let _body = {
        status: 1,
        subMenus: parent.subMenus
    }
    _this.body = _body;
});

trouter.post("/addOrgByDealer", async function (ctx, next) {
    let param = ctx.request.body;
    await handler.addOrgByDealer(param);
    let _body = {
        status: 1
    };
    ctx.body = _body;
});

trouter.post("/addOrgByOrg", async function (ctx, next) {
    let param = ctx.request.body;
    await handler.addOrgByOrg(param);
    let _body = {
        status: 1
    };
    ctx.body = _body;
});

trouter.get("/findOrgById", async function (ctx, next) {
    let _this = ctx;
    let orgs = await handler.findOrgById(_this.request.query.id);
    let _body = {
        status: 1,
        orgs: orgs
    }
    _this.body = _body;
});

trouter.get("/findOrgParentByOrgId",async function (ctx, next){
    let _this = ctx;
    let org = await handler.findOrgParentByOrgId(_this.request.query.id);
    let _body = {
        status: 1,
        org: org
    }
    _this.body = _body;
});

trouter.get("/findOrgAncestor", async function (ctx, next) {
    let _this = ctx;
    let orgs = await handler.findOrgAncestor();
    let _body = {
        status: 1,
        orgs: orgs
    };
    _this.body = _body;
});

trouter.get("/findOrgBySessionOrgId", async function (ctx, next) {
    let _this = ctx;
    let id = _this.session.orgId;
    let orgs = await handler.findOrgById(id);
    let _body = {
        status: 1,
        orgs: orgs
    };
    _this.body = _body;
});

trouter.post("/findOrgByParentId", async function (ctx, next) {
    let _this = ctx;
    let orgs = await handler.findOrgByParentId(_this.request.query.id);
    let _body = {
        status: 1,
        orgs: orgs
    };
    _this.body = _body;
});

trouter.get("/findOrgByConditionAndPage", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let keyword = reqData.keyword;
    let promises = await handler.findOrgByConditionAndPage(keyword , {pageIndex: parseInt(reqData.pageIndex) , pageSize: parseInt(reqData.pageSize)});
    let total = promises[0];
    let orgs = promises[1];
    let _body = {
        status: 1,
        orgs: orgs,
        pageCount: Math.ceil(total / parseInt(reqData.pageSize)),
        pageSize: parseInt(reqData.pageSize),
        pageIndex: parseInt(reqData.pageIndex),
        totalCount: total
    };
    _this.body = _body;
});

trouter.put("/updateOrgById",async function (ctx, next){
    let result = await handler.updateOrgById(ctx.query.id , ctx.request.body);
    ctx.body = {status: 1 === result.ok ? 1 : 0};
});
trouter.delete("/deleteOrgById",async function (ctx, next){
    let result = await handler.deleteOrgById(ctx.query.id);
    let body = {
        status: result.result ? (1 === result.result.ok ? 1 : 0) : 0
    };
    if(0 === body.status){
        body.errorMessage = "删除失败"
    }
    ctx.body = body;
});

trouter.get("/adminRole" , async function(ctx, next){
    let reqData = ctx.request.query,
        pager = {pageIndex: parseInt(reqData.pageIndex) , pageSize: parseInt(reqData.pageSize)},
        params = _.extend({} , reqData),
        promises,
        body;
    delete params.pageIndex;
    delete params.pageSize;
    promises = await handler.findAdminRoleByConditionAndPage(params , pager);
    body = {
        status: 1,
        roles: promises[1],
        pageCount: Math.ceil(promises[0] / parseInt(reqData.pageSize)),
        pageSize: parseInt(reqData.pageSize),
        pageIndex: parseInt(reqData.pageIndex),
        totalCount: promises[0]
    };
    ctx.body = body;
});

trouter.post("/saveRole" , async function(ctx, next){
    let role = ctx.request.body;
    undefined === role.status ? role.status = 1 : undefined;
    await handler.saveRole(role);
    ctx.body = {
        status: 1
    };
});

trouter.get("/findResourceByConditionAndPage", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let keyword = reqData.keyword;
    let promises = await handler.findResourceByConditionAndPage(keyword , {pageIndex: parseInt(reqData.pageIndex) , pageSize: parseInt(reqData.pageSize)});
    let total = promises[0];
    let resource = promises[1];
    let _body = {
        status: 1,
        resource: resource,
        pageCount: Math.ceil(total / parseInt(reqData.pageSize)),
        pageSize: parseInt(reqData.pageSize),
        pageIndex: parseInt(reqData.pageIndex),
        totalCount: total
    };
    _this.body = _body;
});

trouter.get("/findResources", async function (ctx, next) {
    let _this = ctx;
    let resources = await handler.findResources();
    let _body = {
        status: 1,
        resources: resources
    }
    _this.body = _body;
});

trouter.post("/addResource", async function (ctx, next) {
    let _this = ctx;
    let param = _this.request.body;
    await handler.addResource(param);
    let _body = {
        status: 1
    }
    _this.body = _body;
});

trouter.put("/updateResource", async function (ctx, next) {
    let result = await handler.updateResourceById(ctx.query.id , ctx.request.body);
    this.body = {status: 1 === result.ok ? 1 : 0};
});

trouter.delete("/deleteResource",async function (ctx, next){
    let result = await handler.deleteResourceById(ctx.query.id,ctx.query.parent);
    //TODO此处返回对象需要进行成功判断
    let body = {
        status: result.result ? (1 === result.result.ok ? 1 : 0) : 0
    };
    if(0 === body.status){
        body.errorMessage = "删除失败"
    }
    ctx.body = body;
});

trouter.put("/updateRole", async function (ctx, next) {
    let result = await handler.updateRoleById(ctx.query.id , ctx.request.body);
    ctx.body = {status: 1 === result.ok ? 1 : 0};
});

trouter.delete("/deleteRole",async function (ctx, next){
    let result = await handler.deleteRoleById(ctx.query.id);
    //TODO此处返回对象需要进行成功判断
    let body = {
        status: result.result ? (1 === result.result.ok ? 1 : 0) : 0
    };
    if(0 === body.status){
        body.errorMessage = "删除失败"
    }
    ctx.body = body;
});

trouter.get("/findOrganizations" , async function (ctx,next){
    let result = await handler.findOrgs();
    ctx.body = {
        status: 1,
        organizations: result
    }
});

trouter.get("/findSystemLogsList", async function (ctx, next){
    let _this = ctx;
    let reqData = _this.request.query;
    let search = {
        type: reqData.type,
        keyword: reqData.keyword
    };
    let id = _this.session.id;
    let promises = await handler.findSystemLogsList(id,search , {pageIndex: parseInt(reqData.pageIndex) , pageSize: parseInt(reqData.pageSize)});
    let total = promises[0];
    let datas = promises[1];
    let _body = {
        status: 1,
        datas: datas,
        pageCount: Math.ceil(total / parseInt(reqData.pageSize)),
        pageSize: parseInt(reqData.pageSize),
        pageIndex: parseInt(reqData.pageIndex),
        totalCount: total
    };
    _this.body = _body;
});

trouter.post("/addSystemLog", async function (ctx, next) {
    let _this = ctx;
    let param = _this.request.body;
    let result = await handler.addSystemLog(param);
    let _body = result ? {status:1} :{};
    _this.body = _body;
});

trouter.delete("/deleteSystemLog",async function (ctx, next){
    let result = await handler.deleteSystemLog(ctx.query.id);
    //TODO此处返回对象需要进行成功判断
    let body = {
        status: result.result ? (1 === result.result.ok ? 1 : 0) : 0
    };
    if(0 === body.status){
        body.errorMessage = "删除失败"
    }
    ctx.body = body;
});

trouter.put("/updateSystemLogReadState", async function (ctx, next) {
    let result = await handler.updateSystemLogReadState(ctx.query.id);
    ctx.body = {status: 1 === result.ok ? 1 : 0};
});

trouter.get("/getCurrentAdminRole" , async function (ctx, next){
    let roleIds = ctx.session.roleIds;
    let result = await handler.getCurrentAdminRole(roleIds);
    ctx.body = {
        status: 1,
        data: result
    }
});



module.exports = trouter;