/**
 * Created by yong.liu on 2017/5/1.
 */
import Article from './modules/article/Article.vue';

const routes = [
    {
        path: "/article",
        component: Article
    },
    {
        path: "*",
        component: Article
    }
];

export default routes;