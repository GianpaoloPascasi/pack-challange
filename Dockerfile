FROM node:22

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]