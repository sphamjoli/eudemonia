FROM node:20-bookworm
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl build-essential pkg-config libssl-dev ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
  | sh -s -- -y --profile minimal --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"
COPY package.json package-lock.json* ./
RUN npm install --include=optional
COPY . .
RUN chmod +x /app/envio-entrypoint.sh
CMD ["/app/envio-entrypoint.sh"]
