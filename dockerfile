FROM alpine:latest AS build
RUN apk add --no-cache curl
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
COPY . .
COPY .env .env
RUN bun install

FROM alpine:latest
RUN apk add --no-cache libstdc++
COPY --from=build /root/.bun /root/.bun
COPY --from=build /app /app
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
EXPOSE 3000
CMD ["bun", "run", "start"]
