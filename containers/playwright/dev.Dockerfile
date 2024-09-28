FROM mcr.microsoft.com/playwright:v1.47.2-jammy

RUN npm install -g npm@9

WORKDIR /app

COPY package*.json  ./
COPY tsconfig*.json ./

COPY packages/lib-apiclient           ./packages/lib-apiclient
COPY packages/test                    ./packages/test
COPY packages/e2e                     ./packages/e2e

RUN npm ci 

CMD ["npm", "run", "dev"]
