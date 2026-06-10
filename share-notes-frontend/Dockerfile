FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

RUN npm prune --omit=dev

FROM node:24-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    npm install -g serve

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000", "--no-request-logging"]
