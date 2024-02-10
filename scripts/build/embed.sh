#!/bin/bash
################################################################################
#
#  Copyright (C) 2024 retro.ai
#  This file is part of retro3 - https://github.com/RetroAI/retro3
#
#  This file is derived from the PeerTube project under the the AGPLv3 license.
#  https://joinpeertube.org
#
#  SPDX-License-Identifier: AGPL-3.0
#  See the file LICENSE for more information.
#
################################################################################

# Enable strict mode
set -o errexit
set -o pipefail
set -o nounset

#
# Environment paths
#

# Get the absolute path to this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Root directory of the project
PROJECT_DIR="${SCRIPT_DIR}/../.."

# Client directory
CLIENT_DIR="${PROJECT_DIR}/client"

#
# Build embed
#

cd "${CLIENT_DIR}"

mkdir -p ./dist/standalone/videos/

if [ ! -z ${ANALYZE_BUNDLE+x} ] && [ "$ANALYZE_BUNDLE" == true ]; then
  NODE_ENV=production npm run webpack -- --config webpack/webpack.video-embed.js --mode production --json > "./dist/standalone/videos/embed-stats.json"
else
  NODE_ENV=production npm run webpack -- --config webpack/webpack.video-embed.js --mode production
fi
