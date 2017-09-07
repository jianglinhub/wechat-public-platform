/**
 * Created by yong.liu on 2017/5/1.
 */
import Vue from 'vue';
import Vuex from 'vuex';
/*import * as actions from './actions';
import * as getters from './getters';*/
import createLogger from 'vuex/dist/logger';
import config from './modules/config';
import aside from './modules/aside';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        config,
        aside
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
});