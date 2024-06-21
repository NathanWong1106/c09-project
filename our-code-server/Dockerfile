# Development Dockerfile - Not for production use

FROM node:alpine

WORKDIR /usr/src/server

COPY . /usr/src/server/

RUN npm install

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]