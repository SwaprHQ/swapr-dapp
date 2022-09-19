#!/bin/bash
#export TEST_PARAMS='tests/synpress/specs/01transactionless/*/*.ts'
#export TEST_PARAMS='--configFile tests/synpress/synpress.config.ts -s tests/synpress/specs/02transactionfull/*/*.ts'
docker-compose up --build --exit-code-from synpress
