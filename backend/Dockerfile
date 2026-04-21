FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --production=true && npm cache clean --force

COPY --from=builder /app/.medusa ./.medusa

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
