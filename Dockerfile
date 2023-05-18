FROM node:18.15.0

RUN mkdir /api

WORKDIR /api

EXPOSE 3000

COPY package*.json .
COPY prisma .

RUN npm i

COPY . .

RUN npx prisma generate

CMD [ "npm", "run", "start:prod" ]