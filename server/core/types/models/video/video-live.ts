import { VideoLiveModel } from '@server/models/video/video-live.js'
import { PickWith } from '@retroai/retro3-typescript-utils'
import { MVideo } from './video.js'
import { MLiveReplaySetting } from './video-live-replay-setting.js'

type Use<K extends keyof VideoLiveModel, M> = PickWith<VideoLiveModel, K, M>

// ############################################################################

export type MVideoLive = Omit<VideoLiveModel, 'Video' | 'ReplaySetting'>

// ############################################################################

export type MVideoLiveVideo =
  MVideoLive &
  Use<'Video', MVideo>

// ############################################################################

export type MVideoLiveVideoWithSetting =
  MVideoLiveVideo &
  Use<'ReplaySetting', MLiveReplaySetting>
