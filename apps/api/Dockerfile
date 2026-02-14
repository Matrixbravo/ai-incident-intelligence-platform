FROM node:20-bullseye

# python + build deps for sklearn wheels
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install node deps
COPY package*.json ./
RUN npm ci --omit=dev

# Install python deps
COPY ../ml-worker/requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Copy app code
COPY . .

# Copy ml-worker into container
COPY ../ml-worker ./ml-worker

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
