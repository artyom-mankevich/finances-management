FROM node:latest
RUN chown -Rh $USER:$USER /home/
USER $USER
WORKDIR /home/frontend
COPY package-lock.json package.json ./
RUN npm ci 
RUN npm install -g @angular/cli@latest
CMD sh -c 'ng serve --host 0.0.0.0'
