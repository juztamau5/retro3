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

cd "${PROJECT_DIR}"

#
# Build server
#

npm run build:server

#
# Build client
#

# Angular does not support project references, it's the reason why we can't builds concurrently
if [ ! -z ${1+x} ]; then
  npm run build:client -- $1
else
  npm run build:client
fi
