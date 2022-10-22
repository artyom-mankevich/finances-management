FROM node:alpine AS trpo-build
WORKDIR /app
COPY . .
RUN npm ci && npm run build
FROM nginx:alpine
COPY --from=trpo-build  /app/dist/trpo-angular /usr/share/nginx/html
EXPOSE 80