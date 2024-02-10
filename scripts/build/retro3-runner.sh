#!/bin/bash

set -eu

cd ./apps/retro3-runner
rm -rf ./dist

../../node_modules/.bin/tsc -b --verbose
rm -rf ./dist
mkdir ./dist

node ./scripts/build.js
