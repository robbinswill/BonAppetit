# Stage 1
FROM node:17-alpine3.14 as dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Stage 2
FROM node:17-alpine3.14 as builder
WORKDIR /app
COPY . ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

# Stage 3
FROM nginx:1.21.6-alpine as runner
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]