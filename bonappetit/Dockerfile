# Stage 1
FROM public.ecr.aws/docker/library/node:lts-alpine3.14 as dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Stage 2
FROM public.ecr.aws/docker/library/node:lts-alpine3.14 as builder
WORKDIR /app
COPY . ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

# Stage 3
FROM public.ecr.aws/nginx/nginx:1.21-alpine as runner
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]