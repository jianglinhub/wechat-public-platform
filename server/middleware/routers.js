/**
 * Created by ly on 2015/9/8.
 */
const path    = require("path");
const fs      = require("fs");
const compose = require("./compose");

/**
 * 路由配置
 * @returns {*}
 */
function routers(){
    var mildArr = new Array();
    var files = findFile(process.cwd() + path.sep + "server" + path.sep + "controllers",/^trouter\.js$/);
    files.forEach(function(file){
        mildArr.push(require(file).routes());
    });
    return compose(mildArr);
}

/**
 * 匹配指定模式的文件
 * @param pathArr
 * @param filePattern
 * @returns {Array}
 */
function findFile(pathArr,filePattern){
    if(typeof pathArr == "string"){
        pathArr = [pathArr];
    }
    var matchFiles = [],
        filePaths = [];
    pathArr.forEach(function(pah,index,pathArr){
        filePaths = explorer(pah);
        filePaths.forEach(function(file,fileIndex,files){
            var fileName = file.substr(file.lastIndexOf(path.sep) + 1);
            if(filePattern.test(fileName)){
                matchFiles.push(file);
            }
        });
    });
    return matchFiles;
}

/**
 * 递归文件路径
 * @param pth
 * @returns {Array}
 */
function explorer(pth){
    var pathArr = [];
    var files = fs.readdirSync(pth);
    files.forEach(function(file){
        var nextPath = pth + path.sep + file;
        if(fs.lstatSync(nextPath).isDirectory()){
            pathArr = pathArr.concat(explorer(nextPath));
        }else{
            pathArr.push(nextPath);
        }
    });
    return pathArr;
}

module.exports = routers;