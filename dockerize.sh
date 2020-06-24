# remove files
rm -rf node_modules || true
rm -rf lib || true

npm install
npm run build

rm -rf node_modules || true
npm install --production

# docker commands to be added