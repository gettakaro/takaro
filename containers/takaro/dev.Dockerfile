FROM node:18.18.2-bullseye

ENV NODE_ENV=development

WORKDIR /app

RUN npm install -g npm@9

COPY package*.json ./
COPY tsconfig*.json ./

COPY nodemon.json ./
COPY jest.config.js ./
COPY .mocharc.js ./

COPY packages/ ./packages
COPY scripts ./scripts

RUN chown -R node:node /app

USER node

WORKDIR /app

RUN npm ci

CMD ["npm", "run", "start:dev"]
