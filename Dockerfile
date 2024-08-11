FROM node:20.10.0 AS build
RUN mkdir /app
WORKDIR /app
RUN npm i -g pnpm
COPY src nest-cli.json package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json /app/
RUN pnpm i --frozen-lockfile
RUN pnpm run build
FROM node:20.10.0-alpine AS production
RUN mkdir /app
WORKDIR /app
RUN npm i -g pnpm
COPY --from=build /app/dist /app/package.json /app/pnpm-lock.yaml /app/
RUN pnpm i --frozen-lockfile --production
EXPOSE 3000
ENTRYPOINT [ "node", "./main" ]