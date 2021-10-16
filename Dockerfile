FROM node:16-alpine as builder

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages/shared/*.json ./packages/shared/
COPY packages/${PACKAGE}/*.json ./packages/${PACKAGE}/

RUN npm ci

COPY packages/shared/src ./packages/shared/src
COPY packages/${PACKAGE}/src ./packages/${PACKAGE}/src

RUN npm run build



FROM node:16-alpine as runner

# Temporarily lock to this version
# See https://github.com/npm/cli/issues/3847
RUN npm install -g npm@7.18.1

ARG PACKAGE
ENV NODE_ENV=production

WORKDIR /app


COPY --from=builder /app/packages/shared/package*.json /app/packages/shared/
COPY --from=builder /app/packages/${PACKAGE}/package*.json /app/packages/${PACKAGE}/
COPY --from=builder /app/package*.json /app/

RUN npm ci --only=production --workspaces

COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/packages/${PACKAGE}/dist /app/packages/${PACKAGE}/dist

CMD [ "npm", "start", "--if-present" ]