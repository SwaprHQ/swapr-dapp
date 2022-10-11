# syntax=docker/dockerfile:1
FROM synthetixio/docker-e2e:16.17-ubuntu as base

RUN mkdir /app
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

FROM base as test
RUN apt -y update
RUN apt -y upgrade
RUN yarn --frozen-lockfile --prefer-offline --no-audit
COPY . .
