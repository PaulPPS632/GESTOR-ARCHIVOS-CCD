# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install build essentials
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript and verify output
RUN npm run build && \
    ls -la && \
    echo "Contents of build directory:" && \
    ls -la build/

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 8001

# Show directory contents and start
CMD echo "Current directory:" && \
    ls -la && \
    echo "Build directory contents:" && \
    ls -la build/ && \
    node build/index.js