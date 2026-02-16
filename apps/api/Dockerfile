FROM node:20-bullseye

# Install python runtime (needed for ml-worker)
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install node deps
COPY apps/api/package*.json ./
RUN npm ci --omit=dev

# Copy API code (includes src/index.js)
COPY apps/api ./

# Ensure sample data exists at /app/data/sample.json
COPY apps/api/data ./data

# Copy ML worker to /app/ml-worker
COPY apps/ml-worker ./ml-worker

# Install python deps if present
RUN if [ -f ./ml-worker/requirements.txt ]; then \
      pip3 install --no-cache-dir -r ./ml-worker/requirements.txt ; \
    fi

ENV PORT=4000
EXPOSE 4000

# ✅ Your entry file is inside src/
CMD ["node","src/index.js"]
