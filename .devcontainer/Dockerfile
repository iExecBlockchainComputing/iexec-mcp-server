# .devcontainer/Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/base:0-ubuntu-22.04

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends docker-compose git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g \
    prettier \
    eslint \
    @commitlint/cli \
    @commitlint/config-conventional \
