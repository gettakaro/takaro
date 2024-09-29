#!/bin/bash

CONTAINER_NAME="sdtd-server"
START_TIME=$(date +%s)
VOLUME_LOCATION=./_data/sdtd

docker run -d --name $CONTAINER_NAME -v $VOLUME_LOCATION:/data ghcr.io/gameservermanagers/gameserver:sdtd

while true; do
  if [ $(($(date +%s) - $START_TIME)) -gt 3600000 ]; then
    echo "Installation timed out. Stopping the container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    exit 1
  fi

  if docker logs $CONTAINER_NAME 2>&1 | grep -q "Success! App '294420' fully installed."; then
    echo "Installation complete. Stopping the container..."
    break
  fi

  if docker logs $CONTAINER_NAME 2>&1 | grep -q "No update available"; then
    echo "Already installed. Stopping the container..."
    break
  fi

  sleep 10
  echo "Checking if 7D2D installation is complete... ($(($(date +%s) - $START_TIME))s elapsed)"
done

docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

RESULT=$(node ./scripts/items/parse-7d2d.mjs)

mkdir -p ./packages/web-docs/pages/data
echo "$RESULT" >./packages/web-docs/pages/data/items-7d2d.json
echo "$RESULT" >./packages/lib-gameserver/src/gameservers/7d2d/items-7d2d.json
