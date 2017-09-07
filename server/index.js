/**
 * Created by ly on 2016/5/12.
 */
'use strict';
const path        = require('path');
const koa         = require('koa');
const app         = new koa();
const session     = require('koa-session-minimal');
const MongoStore  = require('koa-generic-session-mongo');
const bodyParser  = require('koa-bodyparser');
const send        = require('koa-send');
const jwt         = require('koa-jwt');
const mount       = require('koa-mount');
const staticCache = require('koa-static-cache');
const compress    = require('koa-compress');
const trouters    = require('./middleware/routers');
const Proxy       = require('./middleware/proxy');
const router      = require('./controllers/signin/router');
const config      = require('./config');
const jwtUtil     = require('./util/jwtUtil');
const mongodb     = require('./util/mongodb');
const log         = require("./log/boleLog").boleLog;
const assert      = require('assert');
const webRoot     = path.join(process.cwd(), "webapp");
const nodeEnv     = process.env.NODE_ENV || 'development';

app.use(async (ctx, next) => {
    try {
        let pattern = new RegExp("^/api");
        if(pattern.test(ctx.url)){
            log.info("{method: " + ctx.method + ", url: " + ctx.url + "}");
        }
        await next();
    } catch (err) {
        log.info('--------------authorization------------->%s', err.message);
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        }else{
            assert.ifError(err);
        }
    }
});

app.use(compress({
    filter: function (content_type) {
        return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(async(ctx, next) => {
    ctx.compress = true;
    await next();
});

global.db = mongodb();

app.use(staticCache(webRoot, {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true,
    usePrecompiledGzip: true,
    dynamic: true
}));

app.use(async (ctx, next) => {
    if ('/' == ctx.path){
        ctx.path= "/index.html";
        await send(ctx, ctx.path, { root: webRoot });
    }
    if(!ctx.body || ctx.status == 404) {
        await next();
    }
});

const sessionStore = config.session!="off"? new MongoStore({
    db: config.mongodb.schema,
    host: config.mongodb.host,
    port: config.mongodb.port,
    user: config.mongodb.user,
    password: config.mongodb.pass,
    ttl: config.mongodb.sessionTime
}):null;

app.use(session({
    key: config.pkg.name + "-session",
    store: sessionStore,
    cookie: {
        maxAge: config.mongodb.cookieTime
    }
}));

app.use(Proxy.proxy());

app.use(bodyParser());

app.use(router.routes());

app.use(jwt({
    algorithm: 'RS256',
    secret: jwtUtil.getPublicKey(),
    getToken: ctx => {
        let token = ctx.session.token || ctx.query.token;
        return token;
    }
}).unless({
    path: []
}));

app.use(trouters());

module.exports = app;