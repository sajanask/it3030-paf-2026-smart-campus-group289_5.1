#!/usr/bin/env zsh
set -e

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

./mvnw spring-boot:run
