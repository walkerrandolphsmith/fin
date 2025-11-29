FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn workspace @fin/web build

EXPOSE 3000

CMD ["npm", "run", "start"]
