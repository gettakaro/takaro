FROM node:18 as builder

ENV NODE_ENV=development

WORKDIR /app

RUN apt-get install git -y

# Temporarily lock to this version :(
# See https://github.com/npm/cli/issues/3847
RUN npm install -g npm@7.18.1

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages
COPY scripts ./scripts
COPY prisma ./prisma

COPY nodemon.json ./
COPY jest.config.js ./

RUN ./scripts/dev-init.sh


CMD [ "npm", "run", "start:dev"]