FROM oven/bun:1

WORKDIR /app
COPY tsconfig.json .
COPY package.json .
RUN bun install

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "src/index.ts"]