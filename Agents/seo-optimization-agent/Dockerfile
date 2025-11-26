# Verwende Node.js 18 als Basisimage
FROM node:18-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm ci --only=production

# Kopiere den restlichen Anwendungscode
COPY . .

# Expose den Port, auf dem der Agent läuft
EXPOSE 3010

# Starte den Agenten
CMD ["npm", "start"]