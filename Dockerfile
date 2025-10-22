# ---- Development image ----
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

EXPOSE 3000

# Enable hot reload for dev
CMD ["pnpm", "dev"]