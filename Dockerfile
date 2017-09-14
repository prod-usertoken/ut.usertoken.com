FROM node:6-slim

COPY . /ut
COPY package.json /ut/package.json
COPY .env.example /ut/.env.example

WORKDIR /ut

ENV NODE_ENV production
RUN npm install --production

CMD ["npm","start"]

EXPOSE 9000
