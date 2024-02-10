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
# Supported languages
#

declare -A languages
defaultLanguage="en-US"

languages=(
    ["ar"]="ar"
    ["is"]="is"
    ["fa"]="fa-IR"
    ["en"]="en-US"
    ["vi"]="vi-VN"
    ["hu"]="hu-HU"
    ["th"]="th-TH"
    ["fi"]="fi-FI"
    ["nl"]="nl-NL"
    ["gd"]="gd"
    ["el"]="el-GR"
    ["es"]="es-ES"
    ["oc"]="oc"
    ["pt"]="pt-BR"
    ["pt-PT"]="pt-PT"
    ["sv"]="sv-SE"
    ["pl"]="pl-PL"
    ["ru"]="ru-RU"
    ["zh-Hans"]="zh-Hans-CN"
    ["zh-Hant"]="zh-Hant-TW"
    ["fr"]="fr-FR"
    ["ja"]="ja-JP"
    ["eu"]="eu-ES"
    ["ca"]="ca-ES"
    ["gl"]="gl-ES"
    ["cs"]="cs-CZ"
    ["hr"]="hr"
    ["eo"]="eo"
    ["de"]="de-DE"
    ["it"]="it-IT"
    ["uk"]="uk-UA"
    ["sq"]="sq"
    ["tok"]="tok"
    ["nn"]="nn"
    ["nb"]="nb-NO"
    ["kab"]="kab"
)

#
# Build client
#

cd "${CLIENT_DIR}"

rm -rf ./dist

# TODO

#cp "./dist/$defaultLanguage/manifest.webmanifest" "./dist/manifest.webmanifest"

#
# Build embed
#

cd "${PROJECT_DIR}"
npm run build:embed

# Copy runtime locales
cd "${CLIENT_DIR}"
#cp -r "./src/locale" "./dist/locale"
