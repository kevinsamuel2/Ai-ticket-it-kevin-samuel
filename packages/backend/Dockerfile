# Imagen del backend. Se construye desde la raíz del monorepo para poder usar el package-lock.json compartido:
#   docker build -f packages/backend/Dockerfile -t ai-ticket-it-backend .
FROM node:22-alpine

WORKDIR /app

# Primero solo los package.json: si no cambian las dependencias, Docker reusa la capa del npm ci.
# El de mobile hace falta porque el package-lock.json del monorepo lo incluye.
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/mobile/package.json packages/mobile/
RUN npm ci --workspace=backend --omit=dev --include-workspace-root=false

COPY packages/backend packages/backend

# Zona horaria de Argentina: "Faltan N días" y el día del evento se calculan con la hora local
RUN apk add --no-cache tzdata
ENV TZ=America/Argentina/Buenos_Aires
ENV NODE_ENV=production
ENV SERVER_PORT=3001
EXPOSE 3001

# Usuario sin privilegios (principio de mínimo privilegio)
USER node

WORKDIR /app/packages/backend
CMD ["node", "index.js"]
