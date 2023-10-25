#!/bin/bash
source .env
export DB_NAME="test-database"
export DB_USER="test-username"
export DB_PASSWORD="test-password"
export DB_PORT="5433"

docker-compose up postgres_test -d
sleep 3
DB_HOST=localhost DB_USER=test-username DB_PASSWORD=test-password DB_NAME=test-database DB_PORT=5433 yarn run migrate
lb-nyc lb-mocha --timeout 5000 --allow-console-logs \"dist/__tests__\"
EXIT_CODE=$?


docker-compose down
exit $EXIT_CODE