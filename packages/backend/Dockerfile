# Imagen del backend. Se construye desde la raíz del monorepo para poder usar el package-lock.json compartido:
#   docker build -f packages/backend/Dockerfile -t ai-ticket-it-backend .
FROM node:20-alpine

WORKDIR /app

# Primero solo los package.json: si no cambian las dependencias, Docker reusa la capa del npm ci
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
RUN npm ci --workspace=backend --omit=dev --include-workspace-root=false

COPY packages/backend packages/backend

ENV NODE_ENV=production
ENV SERVER_PORT=3001
EXPOSE 3001

# Usuario sin privilegios (principio de mínimo privilegio)
USER node

WORKDIR /app/packages/backend
CMD ["node", "index.js"]
