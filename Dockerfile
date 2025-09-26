# Base image
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install FFmpeg for audio processing
RUN apt-get update && apt-get install -y ffmpeg

# Copy all backend files
COPY . .

# Expose port
EXPOSE 5000

# Set environment variable for Render (optional, default fallback)
ENV PORT=5000

# Start the server
CMD ["node", "server.js"]
