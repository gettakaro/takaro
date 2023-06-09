FROM node:18-alpine as node-builder

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

FROM docker:24-dind as vm-builder

RUN apk upgrade --no-cache && apk --no-cache add curl gcc libgcc musl-dev protoc

# Install rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup target add x86_64-unknown-linux-musl

WORKDIR /app

RUN mkdir -p /app/firecracker

COPY ./firecracker /app/firecracker
COPY ./packages/vm-agent /app/packages/vm-agent

COPY --from=node-builder /app/node_modules /app/node_modules

COPY ./scripts/dev-vm.sh /app/scripts/dev-vm.sh

RUN chmod +x /app/scripts/dev-vm.sh
RUN sh /app/scripts/dev-vm.sh

FROM node:18-alpine as runner

RUN wget -q https://github.com/firecracker-microvm/firecracker/releases/download/v1.1.2/firecracker-v1.1.2-x86_64.tgz && \
    tar -xf firecracker-v1.1.2-x86_64.tgz && \
    mv release-v1.1.2-x86_64/firecracker-v1.1.2-x86_64 /usr/local/bin/firecracker && \
    mv release-v1.1.2-x86_64/jailer-v1.1.2-x86_64 /usr/local/bin/jailer

RUN apk update && apk add iproute2 iptables bash

RUN npm install -g npm@8

ARG PACKAGE
ENV PACKAGE=${PACKAGE}
ENV NODE_ENV=production

WORKDIR /app

COPY --from=node-builder /app/packages/${PACKAGE}/package*.json /app/packages/${PACKAGE}/
COPY --from=node-builder /app/package*.json /app/

# Copy over the prebuilt internal library packages
COPY --from=node-builder /app/libraries /app/

RUN npm ci --only=production

COPY --from=node-builder /app/packages/${PACKAGE}/dist /app/packages/${PACKAGE}/dist

COPY scripts/dev-setup-network-tap.sh ./scripts/dev-setup-network-tap.sh

COPY --from=vm-builder /app/firecracker /app/firecracker

CMD sh -c "./scripts/dev-setup-network-tap.sh && npm -w packages/${PACKAGE} run start"
