FROM node:20

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

RUN chown -R node:node /app/dist

USER node

EXPOSE 3000

CMD ["npm", "run", "start:prod"]