# Development Dockerfile - Not for production use

FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 4200

CMD ["npm", "run", "start"]