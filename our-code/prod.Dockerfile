FROM node:alpine as build

# Copy npm package files, install, and build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json ./
RUN npm install --silent
COPY . ./
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/our-code /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]