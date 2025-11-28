# CTI Aggregator - Production Docker Build (Optimized)
# Multi-stage build for optimized production image

# ============================================
# Stage 1: Dependencies Stage (Cached)
# ============================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build dependencies (this layer is cached)
RUN apk add --no-cache python3 make g++

# Copy only package files
COPY package*.json ./

# Install dependencies (cached unless package.json changes)
RUN npm ci

# ============================================
# Stage 2: Build Stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files and source
COPY package*.json ./
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production Stage
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only wget for healthcheck (much faster than build tools)
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create attached_assets directory
RUN mkdir -p ./attached_assets && \
    chown -R nodejs:nodejs ./attached_assets

# Set environment variables
ENV NODE_ENV=production \
    PORT=5000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]