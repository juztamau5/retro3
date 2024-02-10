import { VideoState } from '@retroai/retro3-models'
import { AbstractOwnedVideoPublication } from './abstract-owned-video-publication.js'

export class OwnedPublicationAfterAutoUnblacklist extends AbstractOwnedVideoPublication {

  isDisabled () {
    // Don't notify if video is still waiting for transcoding or scheduled update
    return !!this.payload.ScheduleVideoUpdate || (this.payload.waitTranscoding && this.payload.state !== VideoState.PUBLISHED)
  }
}
