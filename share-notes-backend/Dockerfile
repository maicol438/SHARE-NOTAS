FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código del backend
COPY . .

# Usar la variable PORT dinámica que inyecta Render (por defecto 10000)
EXPOSE 10000

CMD ["node", "src/server.js"]