#!/bin/bash

set -eu

rm -rf ./apps/retro3-cli/dist

cd ./apps/retro3-cli

../../node_modules/.bin/concurrently -k \
  "../../node_modules/.bin/tsc -w --noEmit" \
  "node ./scripts/watch.js"
