FROM node:20-bullseye

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/api/package*.json ./
RUN npm ci --omit=dev

COPY apps/api ./

# ✅ Copy shared data into the container
COPY apps/api/data ./data

# ✅ Copy ML worker
COPY apps/ml-worker ./ml-worker

RUN if [ -f ./ml-worker/requirements.txt ]; then \
      pip3 install --no-cache-dir -r ./ml-worker/requirements.txt ; \
    fi

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
