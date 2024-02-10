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

import { HttpStatusCode, ResultList, VideoPlaylistElement } from '@retroai/retro3-models'
import { logger } from '../../../root-helpers'
import { AuthHTTP } from './auth-http'

export class PlaylistFetcher {

  constructor (private readonly http: AuthHTTP) {

  }

  async loadPlaylist (playlistId: string) {
    const playlistPromise = this.loadPlaylistInfo(playlistId)
    const playlistElementsPromise = this.loadPlaylistElements(playlistId)

    let playlistResponse: Response
    let isResponseOk: boolean

    try {
      playlistResponse = await playlistPromise
      isResponseOk = playlistResponse.status === HttpStatusCode.OK_200
    } catch (err) {
      logger.error(err)
      isResponseOk = false
    }

    if (!isResponseOk) {
      if (playlistResponse?.status === HttpStatusCode.NOT_FOUND_404) {
        throw new Error('This playlist does not exist.')
      }

      throw new Error('We cannot fetch the playlist. Please try again later.')
    }

    return { playlistResponse, videosResponse: await playlistElementsPromise }
  }

  async loadAllPlaylistVideos (playlistId: string, baseResult: ResultList<VideoPlaylistElement>) {
    let elements = baseResult.data
    let total = baseResult.total
    let i = 0

    while (total > elements.length && i < 10) {
      const result = await this.loadPlaylistElements(playlistId, elements.length)

      const json = await result.json()
      total = json.total

      elements = elements.concat(json.data)
      i++
    }

    if (i === 10) {
      logger.error('Cannot fetch all playlists elements, there are too many!')
    }

    return elements
  }

  private loadPlaylistInfo (playlistId: string): Promise<Response> {
    return this.http.fetch(this.getPlaylistUrl(playlistId), { optionalAuth: true })
  }

  private loadPlaylistElements (playlistId: string, start = 0): Promise<Response> {
    const url = new URL(this.getPlaylistUrl(playlistId) + '/videos')
    url.search = new URLSearchParams({ start: '' + start, count: '100' }).toString()

    return this.http.fetch(url.toString(), { optionalAuth: true })
  }

  private getPlaylistUrl (id: string) {
    return window.location.origin + '/api/v1/video-playlists/' + id
  }
}
