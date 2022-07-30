FROM node:18-alpine

WORKDIR /home/node/app

RUN chown -R node:node /home/node
USER node

COPY package*.json /home/node/app
RUN npm install

COPY --chown=node:node . /home/node/app

RUN npx prisma generate

EXPOSE 3000
CMD [ "npm" "start" ]