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

import './embed.scss'
import * as Channel from 'jschannel'
import { logger } from '../../root-helpers'
import { Retro3Resolution, Retro3TextTrack } from '../embed-player-api/definitions'
import { Retro3Embed } from './embed'

/**
 * Embed API exposes control of the embed player to the outside world via
 * JSChannels and window.postMessage
 */
export class Retro3EmbedApi {
  private channel: Channel.MessagingChannel
  private isReady = false
  private resolutions: Retro3Resolution[] = []

  private oldVideoElement: HTMLVideoElement
  private videoElPlayListener: () => void
  private videoElPauseListener: () => void
  private videoElEndedListener: () => void
  private videoElInterval: any

  constructor (private readonly embed: Retro3Embed) {

  }

  initialize () {
    this.constructChannel()
  }

  initWithVideo () {
    this.disposeStateTracking()
    this.setupStateTracking()

    if (!this.isReady) {
      this.notifyReady()
    }
  }

  private get element () {
    return this.embed.getPlayerElement()
  }

  private constructChannel () {
    const channel = Channel.build({ window: window.parent, origin: '*', scope: this.embed.getScope() })

    channel.bind('setVideoPassword', (txn, value) => this.embed.setVideoPasswordByAPI(value))

    channel.bind('play', (txn, params) => this.embed.player.play())
    channel.bind('pause', (txn, params) => this.embed.player.pause())
    channel.bind('seek', (txn, time) => this.embed.player.currentTime(time))

    channel.bind('setVolume', (txn, value) => this.embed.player.volume(value))
    channel.bind('getVolume', (txn, value) => this.embed.player.volume())

    channel.bind('isReady', (txn, params) => this.isReady)

    channel.bind('setResolution', (txn, resolutionId) => this.setResolution(resolutionId))
    channel.bind('getResolutions', (txn, params) => this.resolutions)

    channel.bind('getCaptions', (txn, params) => this.getCaptions())
    channel.bind('setCaption', (txn, id) => this.setCaption(id))

    channel.bind('setPlaybackRate', (txn, playbackRate) => this.embed.player.playbackRate(playbackRate))
    channel.bind('getPlaybackRate', (txn, params) => this.embed.player.playbackRate())
    channel.bind('getPlaybackRates', (txn, params) => this.embed.player.options_.playbackRates)

    channel.bind('playNextVideo', (txn, params) => this.embed.playNextPlaylistVideo())
    channel.bind('playPreviousVideo', (txn, params) => this.embed.playPreviousPlaylistVideo())
    channel.bind('getCurrentPosition', (txn, params) => this.embed.getCurrentPlaylistPosition())

    this.channel = channel
  }

  private setResolution (resolutionId: number) {
    logger.info(`Set resolution ${resolutionId}`)

    if (this.isWebVideo() && resolutionId === -1) {
      logger.error('Auto resolution cannot be set in web video player mode')
      return
    }

    this.embed.player.retro3Resolutions().select({ id: resolutionId, fireCallback: true })
  }

  private getCaptions (): Retro3TextTrack[] {
    return this.embed.player.textTracks().tracks_.map(t => ({
      id: t.id,
      src: t.src,
      label: t.label,
      mode: t.mode
    }))
  }

  private setCaption (id: string) {
    const tracks = this.embed.player.textTracks().tracks_

    for (const track of tracks) {
      if (track.id === id) track.mode = 'showing'
      else track.mode = 'disabled'
    }
  }

  /**
   * Let the host know that we're ready to go!
   */
  private notifyReady () {
    this.isReady = true
    this.channel.notify({ method: 'ready', params: true })
  }

  private setupStateTracking () {
    let currentState: 'playing' | 'paused' | 'unstarted' | 'ended' = 'unstarted'

    this.videoElInterval = setInterval(() => {
      const position = this.element.currentTime
      const volume = this.element.volume

      this.channel.notify({
        method: 'playbackStatusUpdate',
        params: {
          position,
          volume,
          duration: this.embed.player.duration(),
          playbackState: currentState
        }
      })
    }, 500)

    // ---------------------------------------------------------------------------

    this.videoElPlayListener = () => {
      currentState = 'playing'
      this.channel.notify({ method: 'playbackStatusChange', params: 'playing' })
    }
    this.element.addEventListener('play', this.videoElPlayListener)

    this.videoElPauseListener = () => {
      currentState = 'paused'
      this.channel.notify({ method: 'playbackStatusChange', params: 'paused' })
    }
    this.element.addEventListener('pause', this.videoElPauseListener)

    this.videoElEndedListener = () => {
      currentState = 'ended'
      this.channel.notify({ method: 'playbackStatusChange', params: 'ended' })
    }
    this.element.addEventListener('ended', this.videoElEndedListener)

    this.oldVideoElement = this.element

    // ---------------------------------------------------------------------------

    // PeerTube specific capabilities
    this.embed.player.retro3Resolutions().on('resolutions-added', () => this.loadResolutions())
    this.embed.player.retro3Resolutions().on('resolutions-changed', () => this.loadResolutions())

    this.loadResolutions()

    this.embed.player.on('volumechange', () => {
      this.channel.notify({
        method: 'volumeChange',
        params: this.embed.player.volume()
      })
    })
  }

  private disposeStateTracking () {
    if (!this.oldVideoElement) return

    this.oldVideoElement.removeEventListener('play', this.videoElPlayListener)
    this.oldVideoElement.removeEventListener('pause', this.videoElPauseListener)
    this.oldVideoElement.removeEventListener('ended', this.videoElEndedListener)

    clearInterval(this.videoElInterval)

    this.oldVideoElement = undefined
  }

  private loadResolutions () {
    this.resolutions = this.embed.player.retro3Resolutions().getResolutions()
      .map(r => ({
        id: r.id,
        label: r.label,
        active: r.selected,
        width: r.width,
        height: r.height
      }))

    this.channel.notify({
      method: 'resolutionUpdate',
      params: this.resolutions
    })
  }

  private isWebVideo () {
    return !!this.embed.player.webVideo
  }
}
