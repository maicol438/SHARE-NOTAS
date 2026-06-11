FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:24-alpine

RUN apk add --no-cache wget && \
    npm install -g serve && \
    mkdir -p /app && chown -R node:node /app

WORKDIR /app

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000", "--no-request-logging"]
