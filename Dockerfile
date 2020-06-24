FROM node:12.15.0-alpine

COPY . /app
WORKDIR /app

CMD ["node","lib/index.js"]