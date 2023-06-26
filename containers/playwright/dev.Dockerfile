FROM mcr.microsoft.com/playwright:v1.35.0-jammy

RUN npm install -g npm@9

WORKDIR /app

COPY package*.json  ./
COPY tsconfig*.json ./

COPY nodemon.json   ./
COPY jest.config.js ./
COPY .mocharc.js    ./

COPY packages/lib-apiclient           ./packages/lib-apiclient
COPY packages/test                    ./packages/test
COPY packages/e2e                     ./packages/e2e

RUN npm ci 
CMD ["npm", "--workspace", "packages/e2e", "run", "dev"]
