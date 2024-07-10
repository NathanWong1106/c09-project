FROM node:alpine

WORKDIR /usr/src/server

COPY package.json package-lock.json ./

RUN npm ci --silent

ENV PORT=3000

COPY . .

EXPOSE 3000

CMD ["npm", "run", "prod"]