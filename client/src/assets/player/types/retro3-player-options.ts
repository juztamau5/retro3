import { LiveVideoLatencyModeType, VideoChapter, VideoFile } from '@retroai/retro3-models'
import { PluginsManager } from '@root-helpers/plugins-manager'
import { Retro3DockPluginOptions } from '../shared/dock/retro3-dock-plugin'
import { PlaylistPluginOptions, VideoJSCaption, VideoJSStoryboard } from './retro3-videojs-typings'

export type PlayerMode = 'web-video' | 'p2p-media-loader'

export type Retro3PlayerContructorOptions = {
  playerElement: () => HTMLVideoElement

  controls: boolean
  controlBar: boolean

  muted: boolean
  loop: boolean

  retro3Link: () => boolean

  playbackRate?: number | string

  enableHotkeys: boolean
  inactivityTimeout: number

  videoViewIntervalMs: number

  instanceName: string

  theaterButton: boolean

  authorizationHeader: () => string

  metricsUrl: string
  serverUrl: string

  errorNotifier: (message: string) => void

  // Current web browser language
  language: string

  pluginsManager: PluginsManager

  autoPlayerRatio?: {
    cssRatioVariable: string
    cssPlayerPortraitModeVariable: string
  }
}

export type Retro3PlayerLoadOptions = {
  mode: PlayerMode

  startTime?: number | string
  stopTime?: number | string

  autoplay: boolean
  forceAutoplay: boolean

  poster: string
  subtitle?: string
  videoViewUrl: string

  embedUrl: string
  embedTitle: string

  isLive: boolean

  liveOptions?: {
    latencyMode: LiveVideoLatencyModeType
  }

  videoCaptions: VideoJSCaption[]
  videoChapters: VideoChapter[]
  storyboard: VideoJSStoryboard

  videoUUID: string
  videoShortUUID: string

  duration: number

  requiresUserAuth: boolean
  videoFileToken: () => string
  requiresPassword: boolean
  videoPassword: () => string

  nextVideo: {
    enabled: boolean
    getVideoTitle: () => string
    handler?: () => void
    displayControlBarButton: boolean
  }

  previousVideo: {
    enabled: boolean
    handler?: () => void
    displayControlBarButton: boolean
  }

  upnext?: {
    isEnabled: () => boolean
    isSuspended: (player: videojs.VideoJsPlayer) => boolean
    timeout: number
  }

  dock?: Retro3DockPluginOptions

  playlist?: PlaylistPluginOptions

  p2pEnabled: boolean

  hls?: HLSOptions
  webVideo?: WebVideoOptions
}

export type WebVideoOptions = {
  videoFiles: VideoFile[]
}

export type HLSOptions = {
  playlistUrl: string
  segmentsSha256Url: string
  trackerAnnounce: string[]
  redundancyBaseUrls: string[]
  videoFiles: VideoFile[]
}
