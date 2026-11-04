FROM denoland/deno:2.2.4

WORKDIR /app

COPY . .
RUN rm -rf node_modules && rm -rf data && deno cache src/Main/Main.ts

EXPOSE 8000

CMD ["run", "--allow-env", "--allow-net", "--allow-read", "--allow-write", "--allow-run", "--allow-sys", "src/Main/Main.ts"]
