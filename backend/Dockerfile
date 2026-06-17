# ============================================================
# Dockerfile — black-classbooking backend (Node 20, ESM)
# ============================================================
# Build:   docker build -t black-classbooking-backend .
# Run:     docker run -p 8080:8080 --env-file .env black-classbooking-backend
# ============================================================

FROM node:20-slim

# Set working directory
WORKDIR /app

# Default to production so the app never falls into dev mode (dev-bypass login,
# insecure JWT fallback) if NODE_ENV is forgotten. Cloud Run can still override.
ENV NODE_ENV=production

# Copy dependency manifests first for better layer caching
COPY package.json ./
COPY package-lock.json* ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source
COPY src ./src
COPY crm-data ./crm-data

# Expose the port (overridable via PORT env at runtime)
EXPOSE 8080

# Health check (optional — requires curl in the image; remove if not needed)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD node -e "fetch('http://localhost:${PORT:-8080}/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]
