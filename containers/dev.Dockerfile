FROM node:18

ENV NODE_ENV=development

WORKDIR /app

# might need iproute2
RUN apt-get install git curl libc6 -y

RUN npm install -g npm@8

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages
COPY scripts ./scripts

COPY nodemon.json ./
COPY jest.config.js ./
COPY .mocharc.js ./


# RUN curl -Lo firecracker.tgz https://github.com/firecracker-microvm/firecracker/releases/download/v1.3.1/firecracker-v1.3.1-x86_64.tgz \
#     && mkdir firecracker \
#     && tar -xf firecracker.tgz -C firecracker \
#     && chmod +x firecracker/release-v1.3.1-x86_64 \
#     && mv firecracker/release-v1.3.1-x86_64 /usr/local/bin/firecracker \
#     && chown node:node /usr/local/bin/firecracker
#
# RUN mkdir /tmp/takaro && chown node:node /tmp/takaro

RUN chown -R node:node /app

USER node

WORKDIR /app

RUN npm ci

CMD ["npm", "run", "start:dev"]
