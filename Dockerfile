FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the main port
EXPOSE 5000

# Expose microservice ports for internal communication
EXPOSE 3001
EXPOSE 3002

# Set production environment
ENV NODE_ENV=production

# Use the hybrid main file that runs everything in one process
CMD ["node", "dist/hybrid-main.js"]