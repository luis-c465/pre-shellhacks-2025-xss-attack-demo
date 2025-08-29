FROM oven/bun:latest

WORKDIR /app
COPY . /app

ENV NODE_ENV=production

RUN bun install --frozen-lockfile --production


EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.ts" ]
