#!/bin/bash

echo "METEOR_SETTINGS=$(cat config/settings.development.json | jq -c .)" > .env
docker-compose up -d --build
