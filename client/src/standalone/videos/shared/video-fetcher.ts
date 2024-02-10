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

import { HttpStatusCode, LiveVideo, VideoDetails, VideoToken } from '@retroai/retro3-models'
import { logger } from '../../../root-helpers'
import { Retro3ServerError } from '../../../types'
import { AuthHTTP } from './auth-http'

export class VideoFetcher {

  constructor (private readonly http: AuthHTTP) {

  }

  async loadVideo ({ videoId, videoPassword }: { videoId: string, videoPassword?: string }) {
    const videoPromise = this.loadVideoInfo({ videoId, videoPassword })

    let videoResponse: Response
    let isResponseOk: boolean

    try {
      videoResponse = await videoPromise
      isResponseOk = videoResponse.status === HttpStatusCode.OK_200
    } catch (err) {
      logger.error(err)

      isResponseOk = false
    }

    if (!isResponseOk) {
      if (videoResponse?.status === HttpStatusCode.NOT_FOUND_404) {
        throw new Error('This video does not exist.')
      }
      if (videoResponse?.status === HttpStatusCode.FORBIDDEN_403) {
        const res = await videoResponse.json()
        throw new Retro3ServerError(res.message || res.detail, res.code)
      }
      throw new Error('We cannot fetch the video. Please try again later.')
    }

    const captionsPromise = this.loadVideoCaptions({ videoId, videoPassword })
    const chaptersPromise = this.loadVideoChapters({ videoId, videoPassword })
    const storyboardsPromise = this.loadStoryboards(videoId)

    return { captionsPromise, chaptersPromise, storyboardsPromise, videoResponse }
  }

  loadLive (video: VideoDetails) {
    return this.http.fetch(this.getLiveUrl(video.uuid), { optionalAuth: true })
      .then(res => res.json() as Promise<LiveVideo>)
  }

  loadVideoToken (video: VideoDetails, videoPassword?: string) {
    return this.http.fetch(this.getVideoTokenUrl(video.uuid), { optionalAuth: true, method: 'POST' }, videoPassword)
      .then(res => res.json() as Promise<VideoToken>)
      .then(token => token.files.token)
  }

  getVideoViewsUrl (videoUUID: string) {
    return this.getVideoUrl(videoUUID) + '/views'
  }

  private loadVideoInfo ({ videoId, videoPassword }: { videoId: string, videoPassword?: string }): Promise<Response> {
    return this.http.fetch(this.getVideoUrl(videoId), { optionalAuth: true }, videoPassword)
  }

  private loadVideoCaptions ({ videoId, videoPassword }: { videoId: string, videoPassword?: string }): Promise<Response> {
    return this.http.fetch(this.getVideoUrl(videoId) + '/captions', { optionalAuth: true }, videoPassword)
  }

  private loadVideoChapters ({ videoId, videoPassword }: { videoId: string, videoPassword?: string }): Promise<Response> {
    return this.http.fetch(this.getVideoUrl(videoId) + '/chapters', { optionalAuth: true }, videoPassword)
  }

  private getVideoUrl (id: string) {
    return window.location.origin + '/api/v1/videos/' + id
  }

  private getLiveUrl (videoId: string) {
    return window.location.origin + '/api/v1/videos/live/' + videoId
  }

  private loadStoryboards (videoUUID: string): Promise<Response> {
    return this.http.fetch(this.getStoryboardsUrl(videoUUID), { optionalAuth: true })
  }

  private getStoryboardsUrl (videoId: string) {
    return window.location.origin + '/api/v1/videos/' + videoId + '/storyboards'
  }

  private getVideoTokenUrl (id: string) {
    return this.getVideoUrl(id) + '/token'
  }
}
