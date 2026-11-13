FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Instalar dependencias primero (aprovecha la cache de capas)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el resto del código
COPY . .

# Coolify inyecta PORT, pero dejamos el default que usa db/db.js
EXPOSE 4000

CMD ["node", "index.js"]
