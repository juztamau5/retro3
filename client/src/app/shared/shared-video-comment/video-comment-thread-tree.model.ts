import { VideoCommentThreadTree as VideoCommentThreadTreeServerModel } from '@retroai/retro3-models'
import { VideoComment } from './video-comment.model'

export class VideoCommentThreadTree implements VideoCommentThreadTreeServerModel {
  comment: VideoComment
  hasDisplayedChildren: boolean
  children: VideoCommentThreadTree[]
}
