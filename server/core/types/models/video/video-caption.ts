import { PickWith } from '@retroai/retro3-typescript-utils'
import { VideoCaptionModel } from '../../../models/video/video-caption.js'
import { MVideo, MVideoUUID } from './video.js'

type Use<K extends keyof VideoCaptionModel, M> = PickWith<VideoCaptionModel, K, M>

// ############################################################################

export type MVideoCaption = Omit<VideoCaptionModel, 'Video'>

// ############################################################################

export type MVideoCaptionLanguage = Pick<MVideoCaption, 'language'>
export type MVideoCaptionLanguageUrl = Pick<MVideoCaption, 'language' | 'fileUrl' | 'filename' | 'getFileUrl' | 'getCaptionStaticPath'>

export type MVideoCaptionVideo =
  MVideoCaption &
  Use<'Video', Pick<MVideo, 'id' | 'remote' | 'uuid'>>

// ############################################################################

// Format for API or AP object

export type MVideoCaptionFormattable =
  MVideoCaption &
  Pick<MVideoCaption, 'language'> &
  Use<'Video', MVideoUUID>
