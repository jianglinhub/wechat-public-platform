FROM registry-vpc.cn-hangzhou.aliyuncs.com/meiauto/ice-node-runner:7.9.0
VOLUME /var/log/ice/

# Fix for "EXDEV: cross-device link not permitted", see https://github.com/npm/npm/issues/9863
RUN cd $(npm root -g)/npm && npm install fs-extra && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js

COPY webapp /ice/webapp
COPY server /ice/server
COPY wechat /ice/wechat
COPY package.json /ice/package.json
COPY startup.sh /ice/startup.sh
COPY server/config.json /ice/config/config.json

WORKDIR /ice/

RUN cp -r /ice-node-cache/node_modules .

RUN npm install --production

ENTRYPOINT ["sh","/ice/startup.sh"]