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

import { ServerErrorCodeType } from '@retroai/retro3-models'

export class Retro3ServerError extends Error {
  serverCode: ServerErrorCodeType

  constructor (message: string, serverCode: ServerErrorCodeType) {
    super(message)
    this.name = 'CustomError'
    this.serverCode = serverCode
  }
}
