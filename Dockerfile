FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 4000

CMD ["node", "dist/main"]