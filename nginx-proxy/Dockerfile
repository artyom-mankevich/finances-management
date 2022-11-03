FROM nginx:1.19.2-alpine

ARG DOMAIN_NAME

COPY ./server.conf /etc/nginx/conf.d/default.conf
RUN sed -e "s/{{DOMAIN_NAME}}/$DOMAIN_NAME/g" /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf
