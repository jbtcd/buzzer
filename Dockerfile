FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY . /app

RUN npm install --production

CMD [ "node", "index.js" ]
