FROM oven/bun:latest
# Set Bun in PATH
ENV PATH="/root/.bun/bin:$PATH"

# Set working directory and copy files
WORKDIR /
COPY . .
RUN bun install

# Expose the app’s port and set the command to start the app on deployment
EXPOSE 3000
CMD ["bun", "run", "start"]
