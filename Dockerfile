FROM node:16-apline AS BUILD_IMAGE

WORKDIR /app

RUN apk update && apk add git 

COPY ./*.json ./yarn.lock ./

RUN  yarn install --frozen-lockfile 

COPY ./src ./src 

RUN yarn build

RUN yarn install --frozen-lockfile --production

FROM gcr.io/distroless/nodejs:16
COPY --from=BUILD_IMAGE /app/lib /app/lib
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules

WORKDIR /app

COPY ./*js ./package.json ./tsconfig.json ./yarn.lock ./

USER 1000

CMD ["dist/servers/apollo-server.js"]