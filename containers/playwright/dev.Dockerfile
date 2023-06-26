FROM mcr.microsoft.com/playwright:v1.35.0-jammy

ARG CADDY_VERSION="2.4.6"

RUN curl -L -o caddy.tar.gz "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_amd64.tar.gz" && \
    tar -xzf caddy.tar.gz && \
    mv caddy /usr/bin/caddy && \
    rm caddy.tar.gz

RUN npm install -g npm@9

WORKDIR /app

COPY package*.json  ./
COPY tsconfig*.json ./

COPY packages/lib-apiclient           ./packages/lib-apiclient
COPY packages/test                    ./packages/test
COPY packages/e2e                     ./packages/e2e

RUN npm ci 

# Add a shell script to start Caddy and npm
RUN echo $'#!/bin/sh\n\
npm --workspace packages/e2e run caddy &\n\
npm --workspace packages/e2e run dev' > /start.sh && \
chmod +x /start.sh

# Run the script when the container starts
CMD ["/start.sh"]
