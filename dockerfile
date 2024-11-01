# Use Bun base image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package.json and lock file, then install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the application files
COPY . .

# Expose the port
EXPOSE ${PORT}

# Run the application
CMD ["bun", "run", "index.ts"]
