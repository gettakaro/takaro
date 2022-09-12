FROM node:18

ENV NODE_ENV=development

WORKDIR /app

RUN apt-get install git -y

# Temporarily lock to this version :(
# See https://github.com/npm/cli/issues/3847
RUN npm install -g npm@7.18.1

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages
COPY scripts ./scripts

COPY nodemon.json ./
COPY jest.config.js ./

RUN chown -R node:node /app

USER node

WORKDIR /app

RUN npm ci

CMD ["npm", "run", "start:dev"]