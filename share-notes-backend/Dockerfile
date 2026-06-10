FROM node:24-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar exclusivamente dependencias de producción (como root)
RUN npm ci --omit=dev && npm cache clean --force

# Transferir propiedad al usuario seguro node
RUN chown -R node:node /app

# Copiar el código fuente (preservando propiedad)
COPY --chown=node:node . .

# Transferir control al usuario seguro no-root
USER node

EXPOSE 4000

CMD ["node", "src/server.js"]