FROM node:10-alpine

WORKDIR /usr/src/app
EXPOSE 5000
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
RUN yarn tsc --noEmit false  --outDir lib

CMD ["node", "lib/server/start.js"]
