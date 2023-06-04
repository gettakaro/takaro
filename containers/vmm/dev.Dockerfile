FROM node:18-bullseye

ENV NODE_ENV=development

WORKDIR /app

RUN wget --continue --retry-connrefused --waitretry=1 --timeout=20 --tries=3 -q https://github.com/firecracker-microvm/firecracker/releases/download/v1.1.2/firecracker-v1.1.2-x86_64.tgz && \
    tar -xf firecracker-v1.1.2-x86_64.tgz && \
    mv release-v1.1.2-x86_64/firecracker-v1.1.2-x86_64 /usr/local/bin/firecracker && \
    mv release-v1.1.2-x86_64/jailer-v1.1.2-x86_64 /usr/local/bin/jailer

RUN apt-get update && apt-get install -y git net-tools iproute2 iptables socat net-tools iputils-ping traceroute

RUN npm install -g npm@9

COPY package*.json  ./
COPY tsconfig*.json ./

COPY nodemon.json   ./
COPY jest.config.js ./
COPY .mocharc.js    ./

COPY packages/lib-apiclient           ./packages/lib-apiclient
COPY packages/lib-auth                ./packages/lib-auth
COPY packages/lib-config              ./packages/lib-config
COPY packages/lib-db                  ./packages/lib-db
COPY packages/lib-function-helpers    ./packages/lib-function-helpers
COPY packages/lib-gameserver          ./packages/lib-gameserver
COPY packages/lib-http                ./packages/lib-http
COPY packages/lib-queues              ./packages/lib-queues
COPY packages/lib-util                ./packages/lib-util
COPY packages/test                    ./packages/test

COPY packages/app-vmm ./packages/app-vmm

COPY scripts ./scripts

COPY ./containers/takaro/ssh_config /root/.ssh/config

RUN npm ci 

CMD sh -c './scripts/setup-network.sh && npm run -w packages/app-vmm dev'
