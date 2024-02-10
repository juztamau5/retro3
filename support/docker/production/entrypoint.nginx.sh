#!/bin/sh
set -e

# Process the nginx template
SOURCE_FILE="/etc/nginx/conf.d/retro3.template"
TARGET_FILE="/etc/nginx/conf.d/default.conf"
export WEBSERVER_HOST="$RETRO3_WEBSERVER_HOSTNAME"
export RETRO3_HOST="retro3:9000"

envsubst '${WEBSERVER_HOST} ${RETRO3_HOST}' < $SOURCE_FILE > $TARGET_FILE

while :; do
  sleep 12h & wait $!;
  nginx -s reload;
done &

nginx -g 'daemon off;'
