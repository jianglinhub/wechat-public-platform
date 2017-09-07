/**
 * Created by yong.liu on 2016/11/3.
 */
"use strict";

class ErrorUtil{
    constructor(){

    }
    handleError(errorCode, errorJson){
        errorJson = errorJson || require("./error.json");
        let errorMessage = "";
        if(errorCode){
            errorMessage = errorJson[errorCode];
        }
        return errorMessage;
    }
}

module.exports = new ErrorUtil;