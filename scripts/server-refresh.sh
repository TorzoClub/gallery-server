#!/bin/bash
cd ${SERVER_PATH}
nvm use 12.14.0
npm run stop
git fetch
git pull
npm install
npm run start
