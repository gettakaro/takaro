#!/bin/bash

CONTAINER_NAME="rust-server"
START_TIME=$(date +%s)
VOLUME_LOCATION=./_data/rust

docker run -d --name $CONTAINER_NAME -v $VOLUME_LOCATION:/data ghcr.io/gameservermanagers/gameserver:rust

while true; do
  if [ $(($(date +%s) - $START_TIME)) -gt 3600000 ]; then
    echo "Installation timed out. Stopping the container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    exit 1
  fi

  if docker logs $CONTAINER_NAME 2>&1 | grep -q "Success! App '258550' fully installed."; then
    echo "Installation complete. Stopping the container..."
    break
  fi

  if docker logs $CONTAINER_NAME 2>&1 | grep -q "No update available"; then
    echo "Already installed. Stopping the container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    break
  fi

  sleep 10
  echo "Checking if Rust installation is complete... ($(($(date +%s) - $START_TIME))s elapsed)"
done

docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

RESULT=$(node ./scripts/items/parse-rust.mjs)

mkdir -p ./packages/web-docs/pages/data
echo "$RESULT" >./packages/web-docs/pages/data/items-rust.json
echo "$RESULT" >./packages/lib-gameserver/src/gameservers/rust/items-rust.json
