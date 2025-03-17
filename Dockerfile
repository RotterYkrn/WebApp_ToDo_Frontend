FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm
RUN npm install
COPY . .
RUN npx tsc
CMD ["npm", "run", "start"]