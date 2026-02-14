FROM node:20-bullseye

WORKDIR /app

# install python
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy API deps first for caching
COPY apps/api/package*.json ./
RUN npm ci --omit=dev

# Copy API source
COPY apps/api/. .

# Copy ML worker + install python deps
COPY apps/ml-worker/requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

COPY apps/ml-worker ./ml-worker

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
