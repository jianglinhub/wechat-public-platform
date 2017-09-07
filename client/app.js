/**
 * Created by yong.liu on 2017/4/29.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Resource from 'vue-resource';
import VeeValidate, { Validator } from 'vee-validate';
import cn from './modules/common/zh_CN';
import {mobile, noSpace} from './modules/common/validator';
import zpagenav from 'vue-pagenav';

Vue.use(VueRouter);

Vue.use(Resource);

//验证器
const config = {
    errorBagName: 'errors', // change if property conflicts.
    fieldsBagName: 'fields',
    delay: 0,
    locale: 'zh_CN',
    dictionary: null,
    strict: true,
    enableAutoClasses: false,
    classNames: {
        touched: 'touched', // the control has been blurred
        untouched: 'untouched', // the control hasn't been blurred
        valid: 'valid', // model is valid
        invalid: 'invalid', // model is invalid
        pristine: 'pristine', // control has not been interacted with
        dirty: 'dirty' // control has been interacted with
    }
};
Validator.extend('mobile', mobile);
Validator.extend('noSpace', noSpace);
Validator.addLocale(cn);
Vue.use(VeeValidate, config);

zpagenav.default.template = `<nav class="zpagenav">` +
    `<span class="pagination page-link m-r-1">总数:{{total}}</span>` +
    `<ul class="pagination">` +
    `<li :key="index" v-for="(unit,index) in units" :class="'page-item ' + unit.class" :disabled="unit.disabled">` +
    `<a @click.prevent="setPage(unit.page)" class="page-link" :href="setUrl(unit)" :aria-label="unit.ariaLabel">` +
    `<span v-if="unit.isPager" aria-hidden="true" v-html="unit.html"></span>` +
    `<span v-else v-html="unit.html"></span>` +
    `<span v-if="unit.isPager" class="sr-only" v-html="unit.srHtml"></span>` +
    `</a>` +
    `</li>` +
    `</ul>` +
    `</nav>`;
Vue.use(zpagenav);

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'ne-style/less/neb.less';
import './style/app.css'
import store from './modules/store';
import filters from "./modules/common/filter.js";
import App from './modules/App.vue';
import routes from './routes';

Object.keys(filters).forEach(k => Vue.filter(k, filters[k]));

const router = new VueRouter({
    mode:'history',
    routes: routes
});

Vue.http.options.root = '/message';

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});