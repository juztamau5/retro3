#!/bin/bash

set -eu

rm -rf ./apps/retro3-runner/dist

cd ./apps/retro3-runner

../../node_modules/.bin/concurrently -k \
  "../../node_modules/.bin/tsc -w --noEmit" \
  "node ./scripts/watch.js"
