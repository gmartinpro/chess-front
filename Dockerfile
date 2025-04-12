FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 5173

CMD ["yarn", "preview"]