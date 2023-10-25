#!/bin/bash
export $(cat .env)
export DB_NAME="test-database"
export DB_PORT="5433"

docker-compose up postgres_test -d
sleep 3
yarn run build:dev && yarn run migrate
lb-nyc lb-mocha --timeout 5000 --allow-console-logs \"dist/__tests__\"
EXIT_CODE=$?


docker-compose down
exit $EXIT_CODE