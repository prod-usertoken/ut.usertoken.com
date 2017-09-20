FROM node:7-slim

COPY . /usertoken
COPY package.json /usertoken/package.json
COPY .env.example /usertoken/.env.example

WORKDIR /usertoken

ENV NODE_ENV production
RUN npm install --production

CMD ["npm","start"]

EXPOSE 9000
