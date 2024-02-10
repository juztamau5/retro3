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

export type EventHandler<T> = (ev: T) => void

export type PlayerEventType =
  'pause' | 'play' |
  'playbackStatusUpdate' |
  'playbackStatusChange' |
  'resolutionUpdate' |
  'volumeChange'

export interface Retro3Resolution {
  id: any
  label: string
  active: boolean
  height: number

  src?: string
  width?: number
}

export type Retro3TextTrack = {
  id: string
  label: string
  src: string
  mode: TextTrackMode
}
