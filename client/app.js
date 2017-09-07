/**
 * Created by yong.liu on 2017/4/29.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Resource from 'vue-resource';

Vue.use(VueRouter);

Vue.use(Resource);

import store from './modules/store';
import filters from "./modules/common/filter.js";
import App from './modules/App.vue';
import routes from './routes';

Object.keys(filters).forEach(k => Vue.filter(k, filters[k]));

const router = new VueRouter({
    routes: routes
});

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});