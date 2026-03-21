# Etapa 1: Build Angular
FROM node:18 as build-stage

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build

# Etapa 2: Nginx (produção)
FROM nginx:alpine

# Remove arquivos padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia build Angular
COPY --from=build-stage /app/dist/landing-page-ofertas/browser /usr/share/nginx/html

# Configuração nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
