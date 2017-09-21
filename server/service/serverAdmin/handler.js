/**
 * Created by yong.liu on 2016/9/10.
 */
"use strict";
const path            = require("path");
const pwdUtil         = require(path.join(process.cwd(),"server/util/pwdUtil"));
const adminModel      = require(path.join(process.cwd(), "server/models/serverAdmin/admin")).adminModel;
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

    //----------------------------------------admin-------------------------
    //通过id更新用户
    updateAdminById(id, changeObj) {
        if (changeObj.password) {
            changeObj.password = pwdUtil(changeObj.password);
        }
        return adminModel.update({_id: id}, {$set: changeObj}).exec();
    }

    //通过id查找用户（唯一）
    findAdminById(id) {
        return adminModel.findOne({_id: id}).exec();
    }

    //通过ID查找用户详细信息（唯一）
    findAdminDetailById(id) {
        return adminModel.findOne({_id: id}).populate("adminRoles").populate("org").exec();
    }

    //通过条件查找用户
    findAdminByParams(params) {
        if (params.adminRoles) {
            params.adminRoles = mongoose.Types.ObjectId(params.adminRoles);
        }
        if (params.org) {
            params.org = mongoose.Types.ObjectId(params.org);
        }
        if(params.password){
            params.password = pwdUtil(param.password);
        }
        return adminModel.find(params).exec();
    }

    //保存用户
    saveAdmin(param) {
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

    //通过id删除用户
    deleteAdminById(id) {
        return adminModel.remove({_id: id}).exec();
    }

    //通过条件查找用户,支持用户名模糊搜索并分页
    findAdminByParamsAndPageHasFuzzy(params, pager) {
        if (params.title) {
            let pattern = new RegExp(params.username);
            params.username = {$regex: pattern, $options: 'imxs'};
        }
        if (params.create_admin) {
            params.create_admin = mongoose.Types.ObjectId(params.create_admin);
        }
        AdminHandler.searchParamsClearEmptyValue(params);
        return Promise.all([
            adminModel.find(params).count().exec(),
            adminModel.find(params).sort({_id: -1}).populate("create_admin").skip((pager.pageIndex - 1) * pager.pageSize).limit(pager.pageSize).exec()
        ])
    }

}

module.exports = new Service;

