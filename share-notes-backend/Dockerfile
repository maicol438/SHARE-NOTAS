FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar todo el código al contenedor
COPY . .

# Usar la variable PORT dinámica que inyecta Render
EXPOSE 10000

# CONFIGURACIÓN CORRECTA: Tu archivo está dentro de la carpeta src
CMD ["node", "src/server.js"]