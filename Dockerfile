FROM node:10-alpine

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
RUN yarn tsc --noEmit false  --outDir lib

CMD ["node", "lib/server/start.js"]
