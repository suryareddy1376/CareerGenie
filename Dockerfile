# Multi-stage Docker build for CareerGenie

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm ci --only=production
COPY Frontend/ ./
RUN npm run build

# Stage 2: Backend Runtime
FROM node:18-alpine AS backend
WORKDIR /app

# Install backend dependencies
COPY Backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY Backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S careergenie -u 1001

# Set ownership
RUN chown -R careergenie:nodejs /app
USER careergenie

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]