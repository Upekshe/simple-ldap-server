if [[ $# -eq 0 ]] ; then
    echo "Usage dockerize.sh <tag-name>"
    echo "No tag name is provided. Exiting"
    exit 0
fi

echo "Building docker image with tag ${1}"

# docker commands to be 
docker build -t upekshejay/simple-ldap-test-server:${1} .
