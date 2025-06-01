FROM node:23-alpine AS base

WORKDIR /app

COPY ../package*.json .
COPY ../packages/shared-schema ./packages/shared-schema
RUN npm install -g npm
RUN npm install

COPY . ./server

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm run build

FROM nginx:alpine AS production-deploy
COPY --from=production /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
