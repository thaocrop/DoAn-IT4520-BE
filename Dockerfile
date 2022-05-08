FROM node:14.17.3
WORKDIR /

ENV PATH /node_modules/.bin:$PATH

COPY package.json yarn.lock ./

RUN yarn install --network-concurrency 1

COPY . .

EXPOSE 3000

RUN yarn build

CMD ["yarn", "start"]
