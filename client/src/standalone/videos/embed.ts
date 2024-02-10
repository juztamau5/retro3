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
import '../../assets/player/shared/dock/retro3-dock-component'
import '../../assets/player/shared/dock/retro3-dock-plugin'
import { Retro3ServerError } from 'src/types'
import videojs from 'video.js'
import {
  HTMLServerConfig,
  ResultList,
  ServerErrorCode,
  VideoDetails,
  VideoPlaylist,
  VideoPlaylistElement,
  VideoState
} from '@retroai/retro3-models'
import { Retro3Player } from '../../assets/player/retro3-player'
import { TranslationsManager } from '../../assets/player/translations-manager'
import { getParamString, logger, videoRequiresFileToken } from '../../root-helpers'
import { Retro3EmbedApi } from './embed-api'
import {
  AuthHTTP,
  LiveManager,
  Retro3Plugin,
  PlayerOptionsBuilder,
  PlaylistFetcher,
  PlaylistTracker,
  Translations,
  VideoFetcher
} from './shared'
import { PlayerHTML } from './shared/player-html'

export class Retro3Embed {
  player: videojs.Player
  api: Retro3EmbedApi = null

  config: HTMLServerConfig

  private translationsPromise: Promise<{ [id: string]: string }>
  private Retro3PlayerManagerModulePromise: Promise<any>

  private readonly http: AuthHTTP
  private readonly videoFetcher: VideoFetcher
  private readonly playlistFetcher: PlaylistFetcher
  private readonly retro3Plugin: Retro3Plugin
  private readonly playerHTML: PlayerHTML
  private readonly playerOptionsBuilder: PlayerOptionsBuilder
  private readonly liveManager: LiveManager

  private retro3Player: Retro3Player

  private playlistTracker: PlaylistTracker

  private alreadyInitialized = false
  private alreadyPlayed = false

  private videoPassword: string
  private videoPasswordFromAPI: string
  private onVideoPasswordFromAPIResolver: (value: string) => void
  private requiresPassword: boolean

  constructor (videoWrapperId: string) {
    logger.registerServerSending(window.location.origin)

    this.http = new AuthHTTP()

    this.videoFetcher = new VideoFetcher(this.http)
    this.playlistFetcher = new PlaylistFetcher(this.http)
    this.retro3Plugin = new Retro3Plugin(this.http)
    this.playerHTML = new PlayerHTML(videoWrapperId)
    this.playerOptionsBuilder = new PlayerOptionsBuilder(this.playerHTML, this.videoFetcher, this.retro3Plugin)
    this.liveManager = new LiveManager(this.playerHTML)
    this.requiresPassword = false

    try {
      this.config = JSON.parse((window as any)['Retro3ServerConfig'])
    } catch (err) {
      logger.error('Cannot parse HTML config.', err)
    }
  }

  static async main () {
    const videoContainerId = 'video-wrapper'
    const embed = new Retro3Embed(videoContainerId)
    await embed.init()
  }

  getPlayerElement () {
    return this.playerHTML.getPlayerElement()
  }

  getScope () {
    return this.playerOptionsBuilder.getScope()
  }

  // ---------------------------------------------------------------------------

  async init () {
    this.translationsPromise = TranslationsManager.getServerTranslations(window.location.origin, navigator.language)
    this.Retro3PlayerManagerModulePromise = import('../../assets/player/retro3-player')

    // Issue when we parsed config from HTML, fallback to API
    if (!this.config) {
      this.config = await this.http.fetch('/api/v1/config', { optionalAuth: false })
        .then(res => res.json())
    }

    const videoId = this.isPlaylistEmbed()
      ? await this.initPlaylist()
      : this.getResourceId()

    if (!videoId) return

    return this.loadVideoAndBuildPlayer({ uuid: videoId, forceAutoplay: false })
  }

  private async initPlaylist () {
    const playlistId = this.getResourceId()

    try {
      const res = await this.playlistFetcher.loadPlaylist(playlistId)

      const [ playlist, playlistElementResult ] = await Promise.all([
        res.playlistResponse.json() as Promise<VideoPlaylist>,
        res.videosResponse.json() as Promise<ResultList<VideoPlaylistElement>>
      ])

      const allPlaylistElements = await this.playlistFetcher.loadAllPlaylistVideos(playlistId, playlistElementResult)

      this.playlistTracker = new PlaylistTracker(playlist, allPlaylistElements)

      const params = new URL(window.location.toString()).searchParams
      const playlistPositionParam = getParamString(params, 'playlistPosition')

      const position = playlistPositionParam
        ? parseInt(playlistPositionParam + '', 10)
        : 1

      this.playlistTracker.setPosition(position)
    } catch (err) {
      this.playerHTML.displayError(err.message, await this.translationsPromise)
      return undefined
    }

    return this.playlistTracker.getCurrentElement().video.uuid
  }

  private initializeApi () {
    if (!this.playerOptionsBuilder.hasAPIEnabled()) return
    if (this.api) return

    this.api = new Retro3EmbedApi(this)
    this.api.initialize()
  }

  // ---------------------------------------------------------------------------

  setVideoPasswordByAPI (password: string) {
    logger.info('Setting password from API')

    this.videoPasswordFromAPI = password

    if (this.onVideoPasswordFromAPIResolver) {
      this.onVideoPasswordFromAPIResolver(password)
    }
  }

  private getPasswordByAPI () {
    if (this.videoPasswordFromAPI) return Promise.resolve(this.videoPasswordFromAPI)

    return new Promise<string>(res => {
      this.onVideoPasswordFromAPIResolver = res
    })
  }

  // ---------------------------------------------------------------------------

  async playNextPlaylistVideo () {
    const next = this.playlistTracker.getNextPlaylistElement()
    if (!next) {
      logger.info('Next element not found in playlist.')
      return
    }

    this.playlistTracker.setCurrentElement(next)

    return this.loadVideoAndBuildPlayer({ uuid: next.video.uuid, forceAutoplay: false })
  }

  async playPreviousPlaylistVideo () {
    const previous = this.playlistTracker.getPreviousPlaylistElement()
    if (!previous) {
      logger.info('Previous element not found in playlist.')
      return
    }

    this.playlistTracker.setCurrentElement(previous)

    await this.loadVideoAndBuildPlayer({ uuid: previous.video.uuid, forceAutoplay: false })
  }

  getCurrentPlaylistPosition () {
    return this.playlistTracker.getCurrentPosition()
  }

  // ---------------------------------------------------------------------------

  private async loadVideoAndBuildPlayer (options: {
    uuid: string
    forceAutoplay: boolean
  }) {
    const { uuid, forceAutoplay } = options

    this.playerOptionsBuilder.loadCommonParams()
    this.initializeApi()

    try {
      const {
        videoResponse,
        captionsPromise,
        chaptersPromise,
        storyboardsPromise
      } = await this.videoFetcher.loadVideo({ videoId: uuid, videoPassword: this.videoPassword })

      return this.buildVideoPlayer({ videoResponse, captionsPromise, chaptersPromise, storyboardsPromise, forceAutoplay })
    } catch (err) {

      if (await this.handlePasswordError(err)) this.loadVideoAndBuildPlayer({ ...options })
      else this.playerHTML.displayError(err.message, await this.translationsPromise)
    }
  }

  private async buildVideoPlayer (options: {
    videoResponse: Response
    storyboardsPromise: Promise<Response>
    captionsPromise: Promise<Response>
    chaptersPromise: Promise<Response>
    forceAutoplay: boolean
  }) {
    const { videoResponse, captionsPromise, chaptersPromise, storyboardsPromise, forceAutoplay } = options

    const videoInfoPromise = videoResponse.json()
      .then(async (videoInfo: VideoDetails) => {
        this.playerOptionsBuilder.loadVideoParams(this.config, videoInfo)

        const live = videoInfo.isLive
          ? await this.videoFetcher.loadLive(videoInfo)
          : undefined

        const videoFileToken = videoRequiresFileToken(videoInfo)
          ? await this.videoFetcher.loadVideoToken(videoInfo, this.videoPassword)
          : undefined

        return { live, video: videoInfo, videoFileToken }
      })

    const [
      { video, live, videoFileToken },
      translations,
      captionsResponse,
      chaptersResponse,
      storyboardsResponse
    ] = await Promise.all([
      videoInfoPromise,
      this.translationsPromise,
      captionsPromise,
      chaptersPromise,
      storyboardsPromise,
      this.buildPlayerIfNeeded()
    ])

    // If already played, we are in a playlist so we don't want to display the poster between videos
    if (!this.alreadyPlayed) {
      this.retro3Player.setPoster(window.location.origin + video.previewPath)
    }

    const playlist = this.playlistTracker
      ? {
        onVideoUpdate: (uuid: string) => this.loadVideoAndBuildPlayer({ uuid, forceAutoplay: false }),

        playlistTracker: this.playlistTracker,
        playNext: () => this.playNextPlaylistVideo(),
        playPrevious: () => this.playPreviousPlaylistVideo()
      }
      : undefined

    const loadOptions = await this.playerOptionsBuilder.getPlayerLoadOptions({
      video,
      captionsResponse,
      chaptersResponse,
      translations,

      storyboardsResponse,

      videoFileToken: () => videoFileToken,
      videoPassword: () => this.videoPassword,
      requiresPassword: this.requiresPassword,

      playlist,

      live,
      forceAutoplay,
      alreadyPlayed: this.alreadyPlayed
    })
    await this.retro3Player.load(loadOptions)

    if (!this.alreadyInitialized) {
      this.player = this.retro3Player.getPlayer();

      (window as any)['videojsPlayer'] = this.player

      this.buildCSS()

      if (this.api) this.api.initWithVideo()
    }

    this.alreadyInitialized = true

    this.player.one('play', () => {
      this.alreadyPlayed = true
    })

    if (this.videoPassword) this.playerHTML.removeVideoPasswordBlock()

    if (video.isLive) {
      this.liveManager.listenForChanges({
        video,
        onPublishedVideo: () => {
          this.liveManager.stopListeningForChanges(video)
          this.loadVideoAndBuildPlayer({ uuid: video.uuid, forceAutoplay: true })
        }
      })

      if (video.state.id === VideoState.WAITING_FOR_LIVE || video.state.id === VideoState.LIVE_ENDED) {
        this.liveManager.displayInfo({ state: video.state.id, translations })
        this.retro3Player.disable()
      } else {
        this.correctlyHandleLiveEnding(translations)
      }
    }

    this.retro3Plugin.getPluginsManager().runHook('action:embed.player.loaded', undefined, { player: this.player, videojs, video })
  }

  private buildCSS () {
    const body = document.getElementById('custom-css')

    if (this.playerOptionsBuilder.hasBigPlayBackgroundColor()) {
      body.style.setProperty('--embedBigPlayBackgroundColor', this.playerOptionsBuilder.getBigPlayBackgroundColor())
    }

    if (this.playerOptionsBuilder.hasForegroundColor()) {
      body.style.setProperty('--embedForegroundColor', this.playerOptionsBuilder.getForegroundColor())
    }
  }

  // ---------------------------------------------------------------------------

  private getResourceId () {
    const urlParts = window.location.pathname.split('/')
    return urlParts[urlParts.length - 1]
  }

  private isPlaylistEmbed () {
    return window.location.pathname.split('/')[1] === 'video-playlists'
  }

  // ---------------------------------------------------------------------------

  private correctlyHandleLiveEnding (translations: Translations) {
    this.player.one('ended', () => {
      // Display the live ended information
      this.liveManager.displayInfo({ state: VideoState.LIVE_ENDED, translations })

      this.retro3Player.disable()
    })
  }

  private async handlePasswordError (err: Retro3ServerError) {
    let incorrectPassword: boolean = null
    if (err.serverCode === ServerErrorCode.VIDEO_REQUIRES_PASSWORD) incorrectPassword = false
    else if (err.serverCode === ServerErrorCode.INCORRECT_VIDEO_PASSWORD) incorrectPassword = true

    if (incorrectPassword === null) return false

    this.requiresPassword = true

    if (this.playerOptionsBuilder.mustWaitPasswordFromEmbedAPI()) {
      logger.info('Waiting for password from Embed API')

      const videoPasswordFromAPI = await this.getPasswordByAPI()

      if (videoPasswordFromAPI && this.videoPassword !== videoPasswordFromAPI) {
        logger.info('Using video password from API')

        this.videoPassword = videoPasswordFromAPI

        return true
      }

      logger.error('Password from embed API is not valid')

      return false
    }

    this.videoPassword = await this.playerHTML.askVideoPassword({
      incorrectPassword,
      translations: await this.translationsPromise
    })

    return true
  }

  private async buildPlayerIfNeeded () {
    if (this.retro3Player) {
      this.retro3Player.enable()

      return
    }

    const playerElement = document.createElement('video')
    playerElement.className = 'video-js vjs-retro3-skin'
    playerElement.setAttribute('playsinline', 'true')

    this.playerHTML.setPlayerElement(playerElement)
    this.playerHTML.addPlayerElementToDOM()

    const [ { Retro3Player } ] = await Promise.all([
      this.Retro3PlayerManagerModulePromise,
      this.retro3Plugin.loadPlugins(this.config, await this.translationsPromise)
    ])

    const constructorOptions = this.playerOptionsBuilder.getPlayerConstructorOptions({
      serverConfig: this.config,
      authorizationHeader: () => this.http.getHeaderTokenValue()
    })
    this.retro3Player = new Retro3Player(constructorOptions)

    this.player = this.retro3Player.getPlayer()
  }
}

Retro3Embed.main()
  .catch(err => {
    (window as any).displayIncompatibleBrowser()

    logger.error('Cannot init embed.', err)
  })
