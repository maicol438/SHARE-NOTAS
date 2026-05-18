FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código del backend
COPY . .

# Usar la variable PORT dinámica que inyecta Render
EXPOSE 10000

# CORRECCIÓN: Quitamos el 'src/' para que busque el archivo directamente en la raíz
CMD ["node", "server.js"]