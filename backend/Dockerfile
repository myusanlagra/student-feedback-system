
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY server.js ./

# Copy frontend files to correct path
COPY ../frontend ./frontend

EXPOSE 3000

CMD ["node", "server.js"]
