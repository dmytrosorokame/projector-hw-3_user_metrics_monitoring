FROM node:alpine

WORKDIR /api

COPY api/package*.json ./

RUN npm install

COPY api/ .

CMD ["npm", "start"]