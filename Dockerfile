# Etapa 1: Build do Angular
FROM node:18 as build-stage

WORKDIR /app
COPY . .

# Adiciona o --legacy-peer-deps aqui 👇
RUN npm install --legacy-peer-deps
RUN npm run build --prod

# Etapa 2: Executar com PM2 + http-server
FROM node:18

RUN npm install -g http-server pm2

WORKDIR /app
COPY --from=build-stage /app/dist/landing-page-ofertas/browser/ ./dist

EXPOSE 3000

CMD ["pm2-runtime", "start", "http-server", "--", "dist", "-p", "3000"]