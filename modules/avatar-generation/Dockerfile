# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories for data
RUN mkdir -p ../../data/avatars ../../data/avatar-templates ../../data/avatar-jobs

# Expose port
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3011/health', (res) => {if(res.statusCode!==200) process.exit(1)})"

# Start the agent
CMD ["node", "standalone-agent.js"]