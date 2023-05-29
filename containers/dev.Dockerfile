FROM node:18-bullseye

ENV NODE_ENV=development

RUN wget --continue --retry-connrefused --waitretry=1 --timeout=20 --tries=3 -q https://github.com/firecracker-microvm/firecracker/releases/download/v1.1.2/firecracker-v1.1.2-x86_64.tgz && \
    tar -xf firecracker-v1.1.2-x86_64.tgz && \
    mv release-v1.1.2-x86_64/firecracker-v1.1.2-x86_64 /usr/local/bin/firecracker && \
    mv release-v1.1.2-x86_64/jailer-v1.1.2-x86_64 /usr/local/bin/jailer

RUN apt-get update && apt-get install -y git net-tools iproute2 iptables socat net-tools iputils-ping traceroute

WORKDIR /app

# Version 9+ is required to run npm scripts as root
RUN npm install -g npm@9

# Fix to avoid requiring root permissions 
RUN npm config set cache /app/.npm-cache --global

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages
COPY scripts ./scripts

COPY nodemon.json ./
COPY jest.config.js ./
COPY .mocharc.js ./

RUN npm ci

CMD sh -c './scripts/setup-network.sh && npm run start:dev'
