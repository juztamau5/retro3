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

import * as Channel from 'jschannel'
import { EventHandler, Retro3Resolution, Retro3TextTrack, PlayerEventType } from './definitions'
import { EventRegistrar } from './events'

const PASSTHROUGH_EVENTS = [
  'pause',
  'play',
  'playbackStatusUpdate',
  'playbackStatusChange',
  'resolutionUpdate',
  'volumeChange'
]

/**
 * Allows for programmatic control of a retro3 embed running in an <iframe>
 * within a web page.
 */
export class Retro3Player {

  private readonly eventRegistrar: EventRegistrar = new EventRegistrar()
  private channel: Channel.MessagingChannel
  private readyPromise: Promise<void>

  /**
   * Construct a new Retro3Player for the given retro3 embed iframe.
   * Optionally provide a `scope` to ensure that messages are not crossed
   * between multiple retro3 embeds. The string passed here must match the
   * `scope=` query parameter on the embed URL.
   *
   * @param embedElement
   * @param scope
   */
  constructor (
    private readonly embedElement: HTMLIFrameElement,
    private readonly scope?: string
  ) {
    this.eventRegistrar.registerTypes(PASSTHROUGH_EVENTS)

    this.constructChannel()
    this.prepareToBeReady()
  }

  /**
   * Destroy the player object and remove the associated player from the DOM.
   */
  destroy () {
    this.embedElement.remove()
  }

  /**
   * Listen to an event emitted by this player.
   *
   * @param event One of the supported event types
   * @param handler A handler which will be passed an event object (or undefined if no event object is included)
   */
  addEventListener (event: PlayerEventType, handler: EventHandler<any>): boolean {
    return this.eventRegistrar.addListener(event, handler)
  }

  /**
   * Remove an event listener previously added with addEventListener().
   *
   * @param event The name of the event previously listened to
   * @param handler
   */
  removeEventListener (event: PlayerEventType, handler: EventHandler<any>): boolean {
    return this.eventRegistrar.removeListener(event, handler)
  }

  /**
   * Promise resolves when the player is ready.
   */
  get ready (): Promise<void> {
    return this.readyPromise
  }

  /**
   * Tell the embed to start/resume playback
   */
  async play () {
    await this.sendMessage('play')
  }

  /**
   * Tell the embed to pause playback.
   */
  async pause () {
    await this.sendMessage('pause')
  }

  /**
   * Tell the embed to change the audio volume
   *
   * @param value A number from 0 to 1
   */
  async setVolume (value: number) {
    await this.sendMessage('setVolume', value)
  }

  /**
   * Get the current volume level in the embed.
   *
   * @param value A number from 0 to 1
   */
  async getVolume (): Promise<number> {
    return this.sendMessage<undefined, number>('getVolume')
  }

  /**
   * Tell the embed to change the current caption
   *
   * @param value Caption id
   */
  async setCaption (value: string) {
    await this.sendMessage('setCaption', value)
  }

  /**
   * Get video captions
   */
  async getCaptions (): Promise<Retro3TextTrack[]> {
    return this.sendMessage<undefined, Retro3TextTrack[]>('getCaptions')
  }

  /**
   * Tell the embed to seek to a specific position (in seconds)
   *
   * @param seconds
   */
  async seek (seconds: number) {
    await this.sendMessage('seek', seconds)
  }

  /**
   * Tell the embed to switch resolutions to the resolution identified
   * by the given ID.
   *
   * @param resolutionId The ID of the resolution as found with getResolutions()
   */
  async setResolution (resolutionId: any) {
    await this.sendMessage('setResolution', resolutionId)
  }

  /**
   * Retrieve a list of the available resolutions. This may change later, listen to the
   * `resolutionUpdate` event with `addEventListener` in order to be updated as the available
   * resolutions change.
   */
  async getResolutions (): Promise<Retro3Resolution[]> {
    return this.sendMessage<undefined, Retro3Resolution[]>('getResolutions')
  }

  /**
   * Retrieve a list of available playback rates.
   */
  async getPlaybackRates (): Promise<number[]> {
    return this.sendMessage<undefined, number[]>('getPlaybackRates')
  }

  /**
   * Get the current playback rate. Defaults to 1 (1x playback rate).
   */
  async getPlaybackRate (): Promise<number> {
    return this.sendMessage<undefined, number>('getPlaybackRate')
  }

  /**
   * Set the playback rate. Should be one of the options returned by getPlaybackRates().
   * Passing 0.5 means half speed, 1 means normal, 2 means 2x speed, etc.
   *
   * @param rate
   */
  async setPlaybackRate (rate: number) {
    await this.sendMessage('setPlaybackRate', rate)
  }

  /**
   * Play next video in playlist
   */
  async playNextVideo () {
    await this.sendMessage('playNextVideo')
  }

  /**
   * Play previous video in playlist
   */
  async playPreviousVideo () {
    await this.sendMessage('playPreviousVideo')
  }

  /**
   * Get video position currently played (starts from 1)
   */
  async getCurrentPosition () {
    return this.sendMessage<undefined, number>('getCurrentPosition')
  }

  /**
   * Set video password to so the user doesn't have to manually fill it
   *
   * @param password
   */
  async setVideoPassword (password: string): Promise<void> {
    await this.sendMessage('setVideoPassword', password)
  }

  private constructChannel () {
    this.channel = Channel.build({
      window: this.embedElement.contentWindow,
      origin: '*',
      scope: this.scope || 'retro3'
    })
    this.eventRegistrar.bindToChannel(this.channel)
  }

  private prepareToBeReady () {
    let readyResolve: () => void
    let readyReject: () => void

    this.readyPromise = new Promise<void>((res, rej) => {
      readyResolve = res
      readyReject = rej
    })

    this.channel.bind('ready', success => success ? readyResolve() : readyReject())
    this.channel.call({
      method: 'isReady',
      success: isReady => isReady ? readyResolve() : null
    })
  }

  private sendMessage<TIn, TOut> (method: string, params?: TIn): Promise<TOut> {
    return new Promise<TOut>((resolve, reject) => {
      this.channel.call({
        method,
        params,
        success: result => resolve(result),
        error: error => reject(error)
      })
    })
  }
}

// put it on the window as well as the export
(window as any)['Retro3Player'] = Retro3Player
