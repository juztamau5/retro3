import { HlsConfig, Level } from 'hls.js'
import videojs from 'video.js'
import { Engine } from '@peertube/p2p-media-loader-hlsjs'
import { VideoChapter, VideoFile, VideoPlaylist, VideoPlaylistElement } from '@retroai/retro3-models'
import { BezelsPlugin } from '../shared/bezels/bezels-plugin'
import { StoryboardPlugin } from '../shared/control-bar/storyboard-plugin'
import { Retro3DockPlugin, Retro3DockPluginOptions } from '../shared/dock/retro3-dock-plugin'
import { HotkeysOptions, Retro3HotkeysPlugin } from '../shared/hotkeys/retro3-hotkeys-plugin'
import { Retro3MobilePlugin } from '../shared/mobile/retro3-mobile-plugin'
import { Html5Hlsjs } from '../shared/p2p-media-loader/hls-plugin'
import { P2pMediaLoaderPlugin } from '../shared/p2p-media-loader/p2p-media-loader-plugin'
import { RedundancyUrlManager } from '../shared/p2p-media-loader/redundancy-url-manager'
import { Retro3Plugin } from '../shared/retro3/retro3-plugin'
import { PlaylistPlugin } from '../shared/playlist/playlist-plugin'
import { Retro3ResolutionsPlugin } from '../shared/resolutions/retro3-resolutions-plugin'
import { StatsCardOptions } from '../shared/stats/stats-card'
import { StatsForNerdsPlugin } from '../shared/stats/stats-plugin'
import { UpNextPlugin } from '../shared/upnext/upnext-plugin'
import { WebVideoPlugin } from '../shared/web-video/web-video-plugin'
import { PlayerMode } from './retro3-player-options'
import { SegmentValidator } from '../shared/p2p-media-loader/segment-validator'
import { ChaptersPlugin } from '../shared/control-bar/chapters-plugin'

declare module 'video.js' {

  export interface VideoJsPlayer {
    srOptions_: HlsjsConfigHandlerOptions

    theaterEnabled: boolean

    // FIXME: add it to upstream typings
    posterImage: {
      show (): void
      hide (): void
    }

    handleTechSeeked_ (): void

    textTracks (): TextTrackList & {
      tracks_: (TextTrack & { id: string, label: string, src: string })[]
    }

    // Plugins

    retro3 (): Retro3Plugin

    webVideo (options?: any): WebVideoPlugin

    p2pMediaLoader (options?: any): P2pMediaLoaderPlugin
    hlsjs (options?: any): any

    retro3Resolutions (): Retro3ResolutionsPlugin

    contextmenuUI (options?: any): any

    bezels (): BezelsPlugin
    retro3Mobile (): Retro3MobilePlugin
    retro3HotkeysPlugin (options?: HotkeysOptions): Retro3HotkeysPlugin

    stats (options?: StatsCardOptions): StatsForNerdsPlugin

    storyboard (options?: StoryboardOptions): StoryboardPlugin

    retro3Dock (options?: Retro3DockPluginOptions): Retro3DockPlugin

    chapters (options?: ChaptersOptions): ChaptersPlugin

    upnext (options?: UpNextPluginOptions): UpNextPlugin

    playlist (options?: PlaylistPluginOptions): PlaylistPlugin
  }
}

export interface VideoJSTechHLS extends videojs.Tech {
  hlsProvider: Html5Hlsjs
}

export interface HlsjsConfigHandlerOptions {
  hlsjsConfig?: HlsConfig

  levelLabelHandler?: (level: Level) => string
}

type Retro3Resolution = {
  id: number

  height?: number
  label?: string
  width?: number
  bitrate?: number

  selected: boolean
  selectCallback: () => void
}

type VideoJSCaption = {
  label: string
  language: string
  src: string
}

type VideoJSStoryboard = {
  url: string
  width: number
  height: number
  interval: number
}

type Retro3PluginOptions = {
  autoPlayerRatio: {
    cssRatioVariable: string
    cssPlayerPortraitModeVariable: string
  }

  hasAutoplay: () => videojs.Autoplay

  videoViewUrl: () => string
  videoViewIntervalMs: number

  authorizationHeader?: () => string

  videoDuration: () => number

  startTime: () => number | string
  stopTime: () => number | string

  videoCaptions: () => VideoJSCaption[]
  isLive: () => boolean
  videoUUID: () => string
  subtitle: () => string

  poster: () => string
}

type MetricsPluginOptions = {
  mode: () => PlayerMode
  metricsUrl: () => string
  videoUUID: () => string
}

type StoryboardOptions = {
  url: string
  width: number
  height: number
  interval: number
}

type ChaptersOptions = {
  chapters: VideoChapter[]
}

type PlaylistPluginOptions = {
  elements: VideoPlaylistElement[]

  playlist: VideoPlaylist

  getCurrentPosition: () => number

  onItemClicked: (element: VideoPlaylistElement) => void
}

type UpNextPluginOptions = {
  timeout: number

  next: () => void
  getTitle: () => string
  isDisplayed: () => boolean
  isSuspended: () => boolean
}

type ProgressBarMarkerComponentOptions = {
  timecode: number
}

type NextPreviousVideoButtonOptions = {
  type: 'next' | 'previous'
  handler?: () => void
  isDisplayed: () => boolean
  isDisabled: () => boolean
}

type Retro3LinkButtonOptions = {
  isDisplayed: () => boolean
  shortUUID: () => string
  instanceName: string
}

type TheaterButtonOptions = {
  isDisplayed: () => boolean
}

type WebVideoPluginOptions = {
  videoFiles: VideoFile[]
  videoFileToken: () => string
}

type P2PMediaLoaderPluginOptions = {
  redundancyUrlManager: RedundancyUrlManager
  type: string
  src: string

  p2pEnabled: boolean

  loader: P2PMediaLoader
  segmentValidator: SegmentValidator

  requiresUserAuth: boolean
  videoFileToken: () => string
}

export type P2PMediaLoader = {
  getEngine(): Engine

  destroy: () => void
}

type VideoJSPluginOptions = {
  playlist?: PlaylistPluginOptions

  retro3: Retro3PluginOptions
  metrics: MetricsPluginOptions

  webVideo?: WebVideoPluginOptions

  p2pMediaLoader?: P2PMediaLoaderPluginOptions
}

type LoadedQualityData = {
  qualitySwitchCallback: (resolutionId: number, type: 'video') => void
  qualityData: {
    video: {
      id: number
      label: string
      selected: boolean
    }[]
  }
}

type ResolutionUpdateData = {
  auto: boolean
  resolutionId: number
  id?: number
}

type AutoResolutionUpdateData = {
  possible: boolean
}

type PlayerNetworkInfo = {
  source: 'web-video' | 'p2p-media-loader'

  http: {
    downloadSpeed?: number
    downloaded: number
  }

  p2p?: {
    downloadSpeed: number
    uploadSpeed: number

    downloaded: number
    uploaded: number

    peersWithWebSeed: number
    peersP2POnly: number
  }

  // In bytes
  bandwidthEstimate?: number
}

type PlaylistItemOptions = {
  element: VideoPlaylistElement

  onClicked: () => void
}

export {
  PlayerNetworkInfo,
  TheaterButtonOptions,
  VideoJSStoryboard,
  PlaylistItemOptions,
  NextPreviousVideoButtonOptions,
  ResolutionUpdateData,
  AutoResolutionUpdateData,
  ProgressBarMarkerComponentOptions,
  PlaylistPluginOptions,
  MetricsPluginOptions,
  VideoJSCaption,
  Retro3PluginOptions,
  WebVideoPluginOptions,
  P2PMediaLoaderPluginOptions,
  Retro3Resolution,
  VideoJSPluginOptions,
  UpNextPluginOptions,
  LoadedQualityData,
  StoryboardOptions,
  ChaptersOptions,
  Retro3LinkButtonOptions
}
