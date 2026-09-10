FROM node:20-alpine AS builder

WORKDIR /build
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM ghcr.io/aibaza/ardmag-backend:latest

WORKDIR /app

# Instaleaza sharp (necesar pentru file-r2-variants/variants.js, nu era in baza imaginii vechi)
RUN npm install sharp --no-save --legacy-peer-deps

# Copiaza toate modulele custom compilate
COPY --from=builder /build/.medusa/server/src/modules/ ./src/modules/

# Copiaza API routes si middleware custom compilate
COPY --from=builder /build/.medusa/server/src/api/ ./src/api/

# Copiaza subscribers compilate (event handlers pe order.placed, customer.created, etc)
COPY --from=builder /build/.medusa/server/src/subscribers/ ./src/subscribers/

# Copiaza cod partajat compilat (ex. src/lib/attribution folosit de subscribers)
COPY --from=builder /build/.medusa/server/src/lib/ ./src/lib/

# Copiaza jobs compilate (cron-uri pentru abandoned-cart-reminder etc)
COPY --from=builder /build/.medusa/server/src/jobs/ ./src/jobs/

# Copiaza scripturile operator-only folosite pentru seed/configurare pe staging
COPY --from=builder /build/.medusa/server/src/scripts/ ./src/scripts/

# Copiaza medusa-config.js cu fan-courier inregistrat
COPY --from=builder /build/.medusa/server/medusa-config.js ./medusa-config.js

EXPOSE 9000
