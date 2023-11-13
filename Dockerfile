FROM node:18-alpine

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 80

CMD ["node", "server.js"]

