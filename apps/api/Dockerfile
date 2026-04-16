FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci
COPY . .
RUN npm run build -w @devboard/api
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@devboard/api"]
