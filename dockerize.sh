if [[ $# -eq 0 ]] ; then
    echo "Usage dockerize.sh <tag-name>"
    echo "No tag name is provided. Exiting"
    exit 0
fi

echo "Building docker image with tag ${1}"
# remove files
rm -rf node_modules || true
rm -rf lib || true

# install required npm packages
npm install
npm run build

#install production dependencies only
npm install --production

# docker commands to be 
docker build -t upekshejay/simple-ldap-server:${1} .