FROM node:alpine

ENV CI=true
ENV WDS_SOKET_PORT=0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY ./ ./

CMD [ "npm", "start" ]