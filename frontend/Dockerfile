# syntax=docker/dockerfile:1

# Tahap 1: Build Aset Web (Node.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Salin manifest dependensi
COPY package.json package-lock.json* ./

# Pasang dependensi
RUN npm install

# Salin seluruh kode sumber frontend
COPY . .

# Argument build untuk konfigurasi base URL API (default: http://localhost:8000)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Kompilasi bundle produksi dengan Vite & Tailwind v4
RUN npm run build

# Tahap 2: Serving Produksi Ringan (Nginx Alpine)
FROM nginx:alpine AS runner

# Salin konfigurasi kustom Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil kompilasi web dari tahap builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Port web server
EXPOSE 80

# Pemeriksaan kesehatan Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
