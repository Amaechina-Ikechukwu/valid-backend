FROM alpine:latest AS build

# Install curl to fetch Bun
RUN apk add --no-cache curl

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"

# Set up working directory and copy app files
WORKDIR /app
COPY . .
COPY .env .env

# Install dependencies with Bun
RUN bun install

# Create a final lightweight production image
FROM alpine:latest
RUN apk add --no-cache libstdc++

# Copy Bun and app from the build stage
COPY --from=build /root/.bun /root/.bun
COPY --from=build /app /app
ENV PATH="/root/.bun/bin:$PATH"

# Set the working directory and expose the port
WORKDIR /app
EXPOSE 3000

# Run the app
CMD ["bun", "run", "start"]
