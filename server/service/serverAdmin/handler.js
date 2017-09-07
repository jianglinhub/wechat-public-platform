/**
 * Created by yong.liu on 2016/9/10.
 */
"use strict";
const path            = require("path");
const pwdUtil         = require(path.join(process.cwd(),"server/util/pwdUtil"));
const adminModel      = require(path.join(process.cwd(), "server/models/serverAdmin/admin")).adminModel;
const mongooseUtil    = require(path.join(process.cwd(), "server/util/mongooseUtil"))();
const mongoose        = require('mongoose');

class AdminHandler{
    constructor(){

    }

    static createParams(params){
        let condition = {};

        if(params.username){
            condition.username = new RegExp(params.username);
        }
        if(params.status){
            condition.status = params.status;
        }
        if(params.roleId){
            condition.$where = mongooseUtil.parseFun(function(){
                var index =0;
                for(; this.adminRoles && (index < this.adminRoles.length); index++){
                    if(params.roleId === this.adminRoles[index].str){
                        return true;
                    }
                }
                return false;
            },{"params.roleId": params.roleId})
        }
        return condition;
    }

    static createAdminRoleSearchCondition(params){
        let condition = {};

        if(params.name){
            condition.name = new RegExp(params.name);
        }
        if(params.status){
            condition.status = params.status;
        }
        return condition;
    }

    saveAdminRole(param, callBack){
        let adminRole = new adminRoleModel({
            name: param.name,
            description: param.description,
            status: param.status
        });
        adminRole.save(callBack);
    }

    removeAdminRole(callBack){
        adminRoleModel.remove(callBack);
    }

    updateAdminRole(conditions, doc, options, callBack){
        adminRoleModel.update(conditions, doc, options, callBack);
    }

    findAdminRole(){
        return adminRoleModel.find({}).exec();
    }

    findAdminRoleById(id){
        return adminRoleModel.findOne({_id:id}).exec();
    }

    saveAdmin(param){
        let admin = new adminModel({
            password: pwdUtil(param.password),
            username: param.username,
            name: param.name,
            gender: param.gender,
            mobile: param.mobile,
            email: param.email,
            address: param.address,
            description: param.description,
            ifAdmin: param.ifAdmin,
            status: param.status,
            passStatus: param.passStatus,
            adminRoles: param.adminRoles,
            org: param.org
        });
        return admin.save();
    }

    removeAdmin(callBack){
        adminModel.remove(callBack);
    }

    updateAdmin(conditions, doc, options){
        return adminModel.update(conditions, doc, options).exec();
    }

    findAdmin(){
        return adminModel.find({}).exec();
    }

    findAdminByUserNameAndPassword(conditions){
        return adminModel.find(conditions).exec();
    }

    fuzzyFindAdminByUserName(username){
        let promise;
        if(username){
            let pattern = new RegExp(username);
            promise = adminModel.find({username: {$regex: pattern, $options: 'imxs'}});
        }else{
            promise = this.findAdmin()
        }
        return promise;
    }

    findAdminByUserNameAndRoleId(username, roleId){
        let promise;
        if(username && roleId){
            promise = adminModel.find({$or: [{username: username}, {adminRoles: {$eq: roleId}}]}).exec();
        }else {
            promise = this.findAdmin();
        }
        return promise;
    }

    findAdminByCondition(params){
        return adminModel.find(AdminHandler.createParams(params)).exec();
    }

    countAdminByCondition(params){
        return adminModel.find(AdminHandler.createParams(params)).count().exec();
    }

    findAdminByConditionAndPage(params,pager){
        return adminModel.find(AdminHandler.createParams(params)).sort({_id:-1}).populate("adminRoles").skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec();
    }

    updateAdminById(id,params){
        if(params.password){
            params.password = pwdUtil(params.password);
        }
        return adminModel.update({_id: id}, {$set: params}).exec();
    }

    deleteAdminById(id){
        return adminModel.remove({_id: id}).exec();
    }

    findAdminById(id){
        return adminModel.findOne({_id: id}).exec();
    }
    //个人中心
    findAdminBySessionId(id){
        return  adminModel.findOne({_id:id}).populate("adminRoles").populate("org").exec();
    }

    //通过用户角色id查询uri
    findResourcesByRoleId(roleIds){
        return  adminRoleModel.find({_id: {$in:roleIds},status:1}).populate({
                path:"resources",
                select:"uri",
                model:resourceModel
        }).exec();
    }
    //权限整合，删除重复uri
    findPermission(roleIds){
        return this.findResourcesByRoleId(roleIds).then(function(res){
            let adminRoles = res;
            let resourceArr = [];
            for(let adminRole of adminRoles){
                for(let resource of adminRole.resources){
                    if(resourceArr.indexOf(resource.uri)<0){
                        resourceArr.push(resource.uri);
                    }
                }
            }
            return resourceArr;
        });
    }
    //资源对比过滤菜单
    findMenusByResource(roleIds){
        return Promise.all([
            this.findPermission(roleIds),
            this.findMenus()
        ]).then(function([uris,menus]){
            for(let menu of menus){
                if(menu.isIndex === 1){
                    for(let uri of uris){
                        if(menu.uri === uri){
                            menu.isShow = 1
                        }
                    }
                }
                for(let subMenu of menu.subMenus){
                    for(let uri of uris){
                        if(menu.uri === uri){
                            menu.isShow = 1
                        }
                        if(subMenu.uri === uri){
                            subMenu.isShow = 1
                        }
                    }
                }
            }
            return menus;

        })
    }

    findMenus(){
        return menuModel.find({}).sort({order:1}).exec();
    }

    addLevel0Menu(param){
        let menuParam={
            name: param.name,
            link: "",
            icon:param.icon,
            type: parseInt(param.type),
            remark: param.remark,
            subMenus: []
        };
        return new menuModel(menuParam).save();
    }

    updateLevel0Menu(param,id){
        let menuParam={
            name: param.name,
            type: Number(param.type),
            remark: param.remark,
            icon:param.icon
        };
        return menuModel.update({_id: id}, {$set: menuParam}).exec();
    }

    delLevel0Menu(id){
        return menuModel.remove({_id: id}).exec();
    }

    //二级菜单增
    addLevel1Menu(param,parentId){
        return this.findSubMenus(parentId).then(function(result){
            let subMenus = result.subMenus;
            let obj = {
                name : param.name,
                link : param.link,
                type : param.type,
                remark : param.remark,
                subMenus :[]
            };
            subMenus.push(obj);
            return menuModel.update({_id: parentId}, {$set: {subMenus:subMenus}});
        });
    }

    //二级菜单改
    editLevel1Menu(param,parentId,subIndex){
        return this.findSubMenus(parentId).then(function(result){
            let subMenus = result.subMenus;
            let i = subIndex;
            subMenus[i].name = param.name ? param.name : subMenus[i].name;
            subMenus[i].link = param.link ? param.link : subMenus[i].link;
            subMenus[i].type = param.type ? param.type : subMenus[i].type;
            subMenus[i].remark = param.remark ? param.remark : subMenus[i].remark;
            return menuModel.update({_id: parentId}, {$set: {subMenus:subMenus}})
        });
    }

    //二级菜单删
    delLevel1Menu(parentId,subIndex){
        return this.findSubMenus(parentId).then(function(result){
            let subMenus = result.subMenus;
            let i = subIndex;
            subMenus.splice(i,1);
            return menuModel.update({_id: parentId}, {$set: {subMenus:subMenus}})
        });
    }

    findSubMenus(id){
        return menuModel.findOne({_id:id}).exec();
    }

    findOrgs(){
        return orgModel.find({}).exec();
    }

    findOrgAncestor(){
        return orgModel.find({parent: null}).exec();
    }

    findOrgByParentId(orgId){
        return orgModel.find({parent: orgId}).exec();
    }

    findOrgParentByOrgId(orgId){
        return orgModel.findOne({_id: orgId}).then(function(org){
            let parentId = org.parent;
            return  orgModel.findOne({_id: parentId}).exec();
        })
    }

    findOrgById(orgId){
        return orgModel.findOne({_id: orgId}).exec()
    }

    findOrgByName(name){
        return orgModel.find({name: name}).exec()
    }

    findOrgByConditionAndPage(keyword, pager){
        let pattern = new RegExp(keyword);
        return Promise.all([
            orgModel.find({name: {$regex: pattern, $options: 'imxs'}}).count().exec(),
            orgModel.find({name: {$regex: pattern, $options: 'imxs'}}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
        ]);
    }
    updateOrgById(id,params){
        return orgModel.update({_id: id}, {$set: params}).exec();
    }
    deleteOrgById(id){
        let _this = this;
        let parentId;
        return _this.findOrgById(id).then(function(org){
            parentId = org.parent;
            return _this.OrgParentIsParent(id);
        }).then(function(num){
            if(num === 1){
                orgModel.update({_id: parentId}, {$set: {isParent:false}}).exec(); //没有子组织机构了
            }
            let objId = mongoose.Types.ObjectId(id);
            orgModel.remove({ancestors: objId}).exec();
            return orgModel.remove({_id: id}).exec();
        });
    }

    OrgParentIsParent(id){
        let objId = mongoose.Types.ObjectId(id);
        return orgModel.find({parent: objId}).count().exec()
    }

    addOrgByDealer(param){
        let orgModelParam = {
            name: param.name,
            code: param.code,
            ancestors: [],
            isParent: false,
            parent: null
        };
        if(param.orgId){
            let orgId = mongoose.Types.ObjectId(param.orgId);
            return this.findOrgById(orgId).then(function(org) {
                orgModel.update({_id: orgId}, {$set: {isParent:true}}).exec();//成为父亲
                orgModelParam.ancestors = org.ancestors;
                orgModelParam.ancestors.push(orgId);
                orgModelParam.parent = orgId;
                let organization = new orgModel(orgModelParam);
                return organization.save();
            })
        }else{
            let organization = new orgModel(orgModelParam);
            return organization.save();
        }
    }

    addOrgByOrg(param){
        let orgModelParam = {
            name: param.name,
            code: "",
            ancestors: [],
            isParent: false,
            parent: null
        };
        if(param.orgId){
            let orgId = mongoose.Types.ObjectId(param.orgId);
            return this.findOrgById(orgId).then(function(org) {
                orgModel.update({_id: orgId}, {$set: {isParent:true}}).exec();//成为父亲
                orgModelParam.ancestors = org.ancestors;
                orgModelParam.ancestors.push(orgId);
                orgModelParam.parent = orgId;
                orgModelParam.code = org.code;
                let organization = new orgModel(orgModelParam);
                return organization.save();
            })
        }else{
            let organization = new orgModel(orgModelParam);
            return organization.save();
        }
    }

    findAdminRoleByConditionAndPage(params,pager){
        return Promise.all([
            this.countAdminRoleByCondition(params),
            adminRoleModel.find(AdminHandler.createAdminRoleSearchCondition(params)).sort({_id:-1}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
        ]);
    }

    countAdminRoleByCondition(params){
        return adminRoleModel.find(AdminHandler.createAdminRoleSearchCondition(params)).count().exec();
    }

    saveRole(role){
        return new adminRoleModel(role).save();
    }

    findResourceById(resourceId){
        return resourceModel.findOne({_id: resourceId}).exec();
    }

    addResource(param){
        let parentId = param.parentId;
        let resourceModelParam = {
            name: param.name,
            code: "",
            uri: param.uri,
            description: param.description,
            isParent:false
        };
        return this.findResourceById(parentId).then(function(resource){
            if(parentId){
                resourceModel.update({_id: parentId}, {$set: {isParent:true}}).exec();//为父资源
            }
            resourceModelParam.ancestors = resource.ancestors || [];
            resourceModelParam.ancestors.push(parentId);
            resourceModelParam.parent = parentId;
            return resourceModelParam;
        }).then(function(resourceModelParam){
            let resource = new resourceModel(resourceModelParam);
            return resource.save();
        });
    }

    updateResourceById(id , params){
        return resourceModel.update({_id: id}, {$set: params}).exec();
    }

    deleteResourceById(id,parent){
        let _this = this ;
        return _this.findResources().then(function(resources){
            let flag = 0;
            for(let i in resources){
                if(parent == resources[i].parent){
                    flag++;
                }
            }
            if(flag===1){
                resourceModel.update({_id: parent}, {$set: {isParent:false}}).exec(); //子资源删除完之后父资源就不为父资源
            }
            return resourceModel.remove({_id: id}).exec();
        });
    }

    findResourceByConditionAndPage(keyword,pager){
        let pattern = new RegExp(keyword);
        return Promise.all([
            resourceModel.find({name: {$regex: pattern, $options: 'imxs'}}).count().exec(),
            resourceModel.find({name: {$regex: pattern, $options: 'imxs'}}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
        ]);
    }

    findResourceByUri(uri){
        return resourceModel.find({uri: {$regex: pattern, $options: 'imxs'}}).count().exec();
    }

    findChildrenResource(ancestorId){
        return resourceModel.find({ancestors: {$in: [ancestorId]}}).exec();
    }

    findResources(){
        return resourceModel.find({}).exec();
    }

    findOperationById(operationId){
        return operationModel.find({_id: operationId}).exec();
    }

    addOperation(param){
        let operation = new operationModel(param);
        return operation.save();
    }

    findOperations(){
        return operationModel.find({}).exec();
    }

    findPermissionById(permissionId){
        return permissionModel.find({_id: permissionId}).exec();
    }

    addPermission(param){
        let permission = new permissionModel(param);
        return permission.save();
    }

    updateRoleById(id , params){
        console.log(id);
        console.log(params);
        return adminRoleModel.update({_id: id}, {$set: params}).exec();
    }

    deleteRoleById(id){
        return adminRoleModel.remove({_id: id}).exec();
    }

    findSystemLogsList(adminid,search,pager){
        let pattern = new RegExp(search.keyword);
        let type = search.type;
        let adminId = mongoose.Types.ObjectId(adminid);
        if(type === 'title'){
            return Promise.all([
                systemLogModel.find({title: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).count().exec(),
                systemLogModel.find({title: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).sort({receiptTime:-1}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
            ]);
        }else if(type === 'addresser'){
            return Promise.all([
                systemLogModel.find({addresser: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).count().exec(),
                systemLogModel.find({addresser: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).sort({receiptTime:-1}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
            ]);
        }else if(type === 'content'){
            return Promise.all([
                systemLogModel.find({content: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).count().exec(),
                systemLogModel.find({content: {$regex: pattern, $options: 'imxs'}, adminId:adminId}).sort({receiptTime:-1}).skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
            ]);
        }
    }

    addSystemLog(param){
        let systemLog = new systemLogModel(param);
        return systemLog.save();
    }

    deleteSystemLog(logId){
        let idArr = logId.split(",");
        return systemLogModel.remove({_id: {$in:idArr}}).exec();

    }

    updateSystemLogReadState(logId){
        let idArr = logId.split(",");
        for(let i = 0;i<idArr.length;i++){
            if(i === idArr.length-1){
                return systemLogModel.update({_id: idArr[i]}, {$set: {readState : "1"}}).exec();
            }else {
                systemLogModel.update({_id: idArr[i]}, {$set: {readState : "1"}}).exec();
            }
        }
    }

    getCurrentAdminRole(roleIds){
        return adminRoleModel.find({_id : {$in : roleIds}}).exec();
    }

}

module.exports = new AdminHandler;

