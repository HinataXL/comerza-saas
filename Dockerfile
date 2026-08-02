# Etapa 1: Base e instalación
FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias globales necesarias
RUN apk add --no-cache nginx supervisor
RUN npm install -g pm2

# Copiar configuración de dependencias
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar TODAS las dependencias (necesarias para compilar)
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma
RUN cd apps/api && npx prisma generate

# Compilar API
RUN cd apps/api && npm run build

# Configurar variables de entorno temporalmente para el build de Next.js
# Esto asegura que el cliente pueda ser compilado correctamente
ENV NEXT_PUBLIC_API_URL=/api
RUN cd apps/web && npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar Nginx y curl (para healthchecks si es necesario)
RUN apk add --no-cache nginx curl
RUN npm install -g pm2

# Copiar Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados y módulos
COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api ./apps/api
COPY --from=base /app/apps/web ./apps/web
COPY --from=base /app/ecosystem.config.js ./

# Configurar permisos para Nginx en un entorno sin root (opcional, pero buena práctica)
RUN mkdir -p /run/nginx

# Exponer el puerto 8080 (donde Nginx escuchará)
EXPOSE 8080

# Variable de entorno por defecto
ENV NODE_ENV=production

# Crear script de inicio
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'pm2-runtime ecosystem.config.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Ejecutar script de inicio
CMD ["/app/start.sh"]
