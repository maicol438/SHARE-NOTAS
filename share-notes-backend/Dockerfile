FROM node:24-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && chown -R node:node /app

# Copiar todo el código al contenedor (como usuario node)
COPY --chown=node:node . .

# Transferir control al usuario seguro no-root
USER node

EXPOSE 4000

CMD ["node", "src/server.js"]