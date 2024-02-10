/*
 * Copyright (C) 2024 retro.ai
 * This file is part of retro3 - https://github.com/juztamau5/retro3
 *
 * This file is derived from the PeerTube project under the the AGPLv3 license.
 * https://joinpeertube.org
 *
 * SPDX-License-Identifier: AGPL-3.0
 * See the file LICENSE.txt for more information.
 */

// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Reflect.metadata polyfill is only needed in the JIT/dev mode.
//
// In order to load these polyfills early enough (before app code), polyfill.ts imports this file to
// to change the order in the final bundle.
import 'core-js/features/reflect'

export const environment = {
  production: true,
  hmr: false,
  apiUrl: '',
  originServerUrl: ''
}
