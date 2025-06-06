# # Build stage
# FROM node:20-alpine as builder

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY .env ./
COPY ./package*.json ./

RUN npm install 

COPY . .

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start"]
