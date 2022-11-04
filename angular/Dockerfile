FROM trion/ng-cli
WORKDIR /home/frontend
COPY package-lock.json package.json .
RUN npm ci
CMD sh -c 'ng serve --host 0.0.0.0'
