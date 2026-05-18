FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
# Añade esta línea en tu Dockerfile
ENV MONGO_URI=mongodb://localhost:27017/share_notes
COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
