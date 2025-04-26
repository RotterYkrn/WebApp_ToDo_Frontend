FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm
RUN npm install
COPY . .
RUN npx tsc
CMD ["npm", "run", "start"]