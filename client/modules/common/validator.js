/**
 * Created by Caan on 2017/5/18.
 */
export const mobile = {
    messages: {},
    validate: (value, args) => {
        return value.length == 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(value)
    }
};

export const noSpace = {
    messages: {},
    validate: (value, args) => {
        if(value.indexOf(' ') === -1){
            return true
        }else{
            return false
        }
    }
};