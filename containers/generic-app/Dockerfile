FROM node:24.11.0-alpine AS builder

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY scripts ./scripts

COPY packages ./packages

RUN ./scripts/dev-init.sh

RUN npm run -w packages/${PACKAGE} build

# NPM workspaces work by symlinking internal packages in node_nodules
# This doesn't work properly when trying to make light-weight production containers...
# So with this command we prebuild library packages and make them available for later
RUN find packages -type d -name 'lib-*' -exec sh -c 'npm run -w {} build && mkdir -p libraries/{}/ && cp -r {}/dist libraries/{}/ && cp -r {}/package*.json libraries/{}/' \; 

FROM node:24.11.0-alpine AS runner

ARG PACKAGE
ENV PACKAGE=${PACKAGE}
ENV NODE_ENV=production

ARG TAKARO_VERSION=unset
ARG TAKARO_COMMIT=unset
ARG TAKARO_BUILD_DATE=unset
ENV TAKARO_VERSION=${TAKARO_VERSION}
ENV TAKARO_COMMIT=${TAKARO_COMMIT}
ENV TAKARO_BUILD_DATE=${TAKARO_BUILD_DATE}
ENV TAKARO_FULL_VERSION=${TAKARO_VERSION}-${TAKARO_COMMIT}-${TAKARO_BUILD_DATE}
ENV VITE_TAKARO_VERSION=${TAKARO_FULL_VERSION}

WORKDIR /app

COPY --from=builder /app/packages/${PACKAGE}/package*.json /app/packages/${PACKAGE}/
COPY --from=builder /app/package*.json /app/

# Copy over the prebuilt internal library packages
COPY --from=builder /app/libraries /app/

RUN npm ci --only=production

COPY --from=builder /app/packages/${PACKAGE}/dist /app/packages/${PACKAGE}/dist
# Not all packages have a scripts folder, this is why we use the regex
COPY --from=builder /app/packages/${PACKAGE}/script[s] /app/packages/${PACKAGE}/scripts

CMD [ "npm", "-w", "packages/${PACKAGE}", "run" , "start"]
