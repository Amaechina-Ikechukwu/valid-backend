# Use a pre-built Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# # Copy application code
# COPY . .
# COPY .env .env

# Install dependencies with Bun
RUN bun install

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
