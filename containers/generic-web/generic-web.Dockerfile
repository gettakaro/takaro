FROM node:18-alpine as builder

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY scripts/dev-init.sh ./scripts/dev-init.sh
COPY packages ./packages

RUN ./scripts/dev-init.sh

ENV NODE_ENV=production

RUN npm run -w packages/${PACKAGE} build

FROM nginx:stable-alpine
ARG PACKAGE

COPY containers/generic-web/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/packages/${PACKAGE}/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
