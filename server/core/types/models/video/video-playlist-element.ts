import { VideoPlaylistElementModel } from '@server/models/video/video-playlist-element.js'
import { PickWith } from '@retroai/retro3-typescript-utils'
import { MVideoFormattable, MVideoThumbnail, MVideoUrl } from './video.js'
import { MVideoPlaylistPrivacy } from './video-playlist.js'

type Use<K extends keyof VideoPlaylistElementModel, M> = PickWith<VideoPlaylistElementModel, K, M>

// ############################################################################

export type MVideoPlaylistElement = Omit<VideoPlaylistElementModel, 'VideoPlaylist' | 'Video'>

// ############################################################################

export type MVideoPlaylistElementId = Pick<MVideoPlaylistElement, 'id'>

export type MVideoPlaylistElementLight = Pick<MVideoPlaylistElement, 'id' | 'videoId' | 'startTimestamp' | 'stopTimestamp'>

// ############################################################################

export type MVideoPlaylistVideoThumbnail =
  MVideoPlaylistElement &
  Use<'Video', MVideoThumbnail>

export type MVideoPlaylistElementVideoUrlPlaylistPrivacy =
  MVideoPlaylistElement &
  Use<'Video', MVideoUrl> &
  Use<'VideoPlaylist', MVideoPlaylistPrivacy>

// ############################################################################

// Format for API or AP object

export type MVideoPlaylistElementFormattable =
  MVideoPlaylistElement &
  Use<'Video', MVideoFormattable>

export type MVideoPlaylistElementAP =
  MVideoPlaylistElement &
  Use<'Video', MVideoUrl>
