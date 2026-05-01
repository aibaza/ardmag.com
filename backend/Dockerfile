FROM ghcr.io/aibaza/ardmag-backend:latest

WORKDIR /app

# Instaleaza sharp (necesar pentru file-r2-variants/variants.js, nu era in baza imaginii vechi)
RUN npm install sharp --no-save --legacy-peer-deps

# Copiaza toate modulele custom compilate
COPY .medusa/server/src/modules/ ./src/modules/

# Copiaza medusa-config.js cu fan-courier inregistrat
COPY .medusa/server/medusa-config.js ./medusa-config.js

EXPOSE 9000
