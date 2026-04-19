FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for Yarn management
RUN corepack enable

# Copy package.json and yarn lock first for better caching
COPY package.json yarn.lock ./

# Set Yarn to berry version
RUN yarn set version berry

# Copy the rest of the application
COPY . .

# Install dependencies and build the application
RUN yarn install
ARG APP_ENV=production
ENV APP_ENV=$APP_ENV
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nuxtjs -u 1001

# Only copy the necessary output directory and set proper permissions
COPY --from=builder /app/.output ./.output
RUN chown -R nuxtjs:nodejs ./.output

# Expose the port the app will run on
EXPOSE 3000

# Switch to non-root user
USER nuxtjs

# Command to run the application
CMD ["node", ".output/server/index.mjs"]
