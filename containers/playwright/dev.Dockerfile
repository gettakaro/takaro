FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

COPY package*.json  ./
COPY tsconfig*.json ./

COPY packages/lib-apiclient           ./packages/lib-apiclient
COPY packages/test                    ./packages/test
COPY packages/e2e                     ./packages/e2e

RUN npm ci 

CMD ["npm", "run", "dev"]
