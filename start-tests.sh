#!/bin/bash
#export TEST_PARAMS="-s 'tests/synpress/specs/01transactionless/*/*.ts'"
#export TEST_PARAMS="-s 'tests/synpress/specs/02transactionfull/*/*.ts'"
docker-compose up --build --exit-code-from synpress
