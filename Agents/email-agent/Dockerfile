FROM node:18-alpine

WORKDIR /app

# Kopiere Package-Dateien
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm ci --only=production

# Kopiere Anwendungscode
COPY . .

# Expose Port
EXPOSE 3007

# Startbefehl
CMD ["npm", "start"]