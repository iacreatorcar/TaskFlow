# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia la build nell'immagine nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configurazione nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Avvia nginx
CMD ["nginx", "-g", "daemon off;"]
