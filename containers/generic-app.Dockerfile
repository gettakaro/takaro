FROM node:18-alpine as builder

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages

RUN npm ci
RUN npm run -w packages/${PACKAGE} build

# NPM workspaces work by symlinking internal packages in node_nodules
# This doesn't work properly when trying to make light-weight production containers...
# So with this command we prebuild library packages and make them available for later
RUN find packages -type d -name 'lib-*' -exec sh -c 'npm run -w {} build && mkdir -p libraries/{}/ && cp -r {}/dist libraries/{}/ && cp -r {}/package*.json libraries/{}/' \; 

FROM node:18-alpine as runner

# Temporarily lock to this version :(
# See https://github.com/npm/cli/issues/3847
RUN npm install -g npm@7.18.1

ARG PACKAGE
ENV PACKAGE=${PACKAGE}
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/packages/${PACKAGE}/package*.json /app/packages/${PACKAGE}/
COPY --from=builder /app/package*.json /app/

# Copy over the prebuilt internal library packages
COPY --from=builder /app/libraries /app/

RUN npm ci --only=production

COPY --from=builder /app/packages/${PACKAGE}/dist /app/packages/${PACKAGE}/dist

CMD [ "npm", "-w", "packages/${PACKAGE}", "run" , "start"]