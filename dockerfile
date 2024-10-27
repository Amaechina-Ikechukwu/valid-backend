FROM alpine:latest

# Install wget to fetch Bun (or use curl if preferred)
RUN apk add --no-cache wget && \
    wget -qO- https://bun.sh/install | bash

# Set Bun in PATH
ENV PATH="/root/.bun/bin:$PATH"

# Set working directory and copy files
WORKDIR /app
COPY . .
RUN bun install

# Expose the app’s port and set the command to start the app on deployment
EXPOSE 3000
CMD ["bun", "run", "start"]
