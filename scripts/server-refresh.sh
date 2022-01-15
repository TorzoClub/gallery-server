#!/bin/bash
cd ${SERVER_PATH}
npm run stop
git fetch
git pull
npm install
npm run start
