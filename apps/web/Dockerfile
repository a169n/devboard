FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci
COPY . .
RUN npm run build -w @devboard/web
EXPOSE 5173
CMD ["npm", "run", "preview", "-w", "@devboard/web", "--", "--host", "0.0.0.0"]
