FROM ghcr.io/aibaza/ardmag-backend:latest

WORKDIR /app

# Instaleaza sharp (necesar pentru file-r2-variants/variants.js, nu era in baza imaginii vechi)
RUN npm install sharp --no-save --legacy-peer-deps

# Copiaza toate modulele custom compilate
COPY .medusa/server/src/modules/ ./src/modules/

# Copiaza API routes si middleware custom compilate
COPY .medusa/server/src/api/ ./src/api/

# Copiaza subscribers compilate (event handlers pe order.placed, customer.created, etc)
COPY .medusa/server/src/subscribers/ ./src/subscribers/

# Copiaza cod partajat compilat (ex. src/lib/attribution folosit de subscribers)
COPY .medusa/server/src/lib/ ./src/lib/

# Copiaza jobs compilate (cron-uri pentru abandoned-cart-reminder etc)
COPY .medusa/server/src/jobs/ ./src/jobs/

# Copiaza medusa-config.js cu fan-courier inregistrat
COPY .medusa/server/medusa-config.js ./medusa-config.js

EXPOSE 9000
