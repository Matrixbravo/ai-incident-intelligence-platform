FROM node:20-bullseye

# Install python runtime (needed for ML worker)
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy API package files
COPY apps/api/package*.json ./
RUN npm ci --omit=dev

# Copy API code
COPY apps/api ./

# Copy ML worker from repo root (IMPORTANT)
COPY apps/ml-worker ./ml-worker

# Install python deps if exists
RUN if [ -f ./ml-worker/requirements.txt ]; then \
      pip3 install --no-cache-dir -r ./ml-worker/requirements.txt ; \
    fi

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
