/**
 * Created by yong.liu on 2017/5/1.
 */
import Message from './modules/message/Message.vue';

const routes = [
    {
        path: "/Message",
        component: Message
    },
    {
        path: "*",
        component: Message
    }
];

export default routes;