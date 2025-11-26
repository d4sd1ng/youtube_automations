# Verwende Node.js 18 Alpine als Basisimage
FROM node:18-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
RUN npm ci --only=production

# Anwendungscode kopieren
COPY . .

# Port 3000 freigeben
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/stats || exit 1

# Anwendung starten
CMD ["node", "server.js"]