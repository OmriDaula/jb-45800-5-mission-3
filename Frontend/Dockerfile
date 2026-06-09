# Stage 1: build the production static files with node
FROM node:24-alpine as builder

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build:docker

# Stage 2: serve the static files with nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html/

COPY --from=builder /app/dist ./

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
