FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Usamos npm ci para instalar las versiones exactas de tus dependencias fijas
RUN npm ci

COPY . .

# Inyectamos la variable de entorno para que Vite la procese en caliente durante el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

# Copiamos la carpeta compilada de React/Vite al directorio de HTML de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos tu configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]