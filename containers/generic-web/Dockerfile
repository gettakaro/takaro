FROM node:18.18.2-alpine as builder

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY scripts ./scripts
COPY .storybook ./.storybook
COPY packages ./packages

RUN ./scripts/dev-init.sh

ENV NODE_ENV=production

RUN npm run -w packages/${PACKAGE} build

FROM nginx:stable-alpine
ARG PACKAGE

COPY --from=builder /app/packages/${PACKAGE}/dist /usr/share/nginx/html
COPY containers/generic-web/nginx.conf /etc/nginx/nginx.conf

WORKDIR /app
COPY containers/generic-web/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ARG TAKARO_VERSION=unset
ARG TAKARO_COMMIT=unset
ARG TAKARO_BUILD_DATE=unset
ENV TAKARO_VERSION=${TAKARO_VERSION}
ENV TAKARO_COMMIT=${TAKARO_COMMIT}
ENV TAKARO_BUILD_DATE=${TAKARO_BUILD_DATE}
ENV TAKARO_FULL_VERSION=${TAKARO_VERSION}-${TAKARO_COMMIT}-${TAKARO_BUILD_DATE}
ENV VITE_TAKARO_VERSION=${TAKARO_FULL_VERSION}

CMD ["./entrypoint.sh"]
