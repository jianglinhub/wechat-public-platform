/**
 * Created by yong.liu on 2017/5/1.
 */
import {SET_ASIDE_READY} from '../mutation-types'

const state = {
    asideReady: 0
};

const mutations = {
    [SET_ASIDE_READY](state){
        state.asideReady = 1;
    }
};

export default {
    state,
    mutations
}