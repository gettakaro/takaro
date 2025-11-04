FROM node:22.13.1-bullseye

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY nodemon.json ./

COPY packages/ ./packages
COPY scripts ./scripts

RUN chown -R node:node /app

USER node

WORKDIR /app

RUN npm ci

ARG TAKARO_VERSION=unset
ARG TAKARO_COMMIT=unset
ARG TAKARO_BUILD_DATE=unset
ENV TAKARO_VERSION=${TAKARO_VERSION}
ENV TAKARO_COMMIT=${TAKARO_COMMIT}
ENV TAKARO_BUILD_DATE=${TAKARO_BUILD_DATE}
ENV TAKARO_FULL_VERSION=${TAKARO_VERSION}-${TAKARO_COMMIT}-${TAKARO_BUILD_DATE}
ENV VITE_TAKARO_VERSION=${TAKARO_FULL_VERSION}

CMD ["npm", "run", "start:dev"]
