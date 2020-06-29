# ---- Base Node ----
FROM node:12.15.0-alpine AS base
COPY package.json /app/package.json
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules
COPY . /app
RUN npm install
RUN npm run build

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules
# copy required files from dependencies image
COPY --from=dependencies /app/lib ./lib
COPY --from=dependencies /app/config ./config
COPY --from=dependencies /app/cert ./cert
COPY --from=dependencies /app/etc ./etc
CMD ["node","lib/index.js"]