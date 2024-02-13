import { getAbsoluteAPIUrl, getAbsoluteEmbedUrl } from '@app/helpers'
import { Actor } from '@app/shared/shared-main'
import { buildPlaylistWatchPath, retro3Translate } from '@retroai/retro3-core-utils'
import {
  AccountSummary,
  VideoChannelSummary,
  VideoConstant,
  VideoPlaylist as ServerVideoPlaylist,
  VideoPlaylistPrivacyType,
  VideoPlaylistType,
  VideoPlaylistType_Type
} from '@retroai/retro3-models'

export class VideoPlaylist implements ServerVideoPlaylist {
  id: number
  uuid: string
  shortUUID: string

  isLocal: boolean

  url: string

  displayName: string
  description: string
  privacy: VideoConstant<VideoPlaylistPrivacyType>

  videosLength: number

  type: VideoConstant<VideoPlaylistType_Type>

  createdAt: Date | string
  updatedAt: Date | string

  ownerAccount: AccountSummary
  videoChannel?: VideoChannelSummary

  thumbnailPath: string
  thumbnailUrl: string

  embedPath: string
  embedUrl: string

  ownerBy: string

  videoChannelBy?: string

  static buildWatchUrl (playlist: Pick<VideoPlaylist, 'uuid' | 'shortUUID'>) {
    return buildPlaylistWatchPath({ shortUUID: playlist.shortUUID || playlist.uuid })
  }

  constructor (hash: ServerVideoPlaylist, translations: { [ id: string ]: string }) {
    const absoluteAPIUrl = getAbsoluteAPIUrl()

    this.id = hash.id
    this.uuid = hash.uuid
    this.shortUUID = hash.shortUUID

    this.url = hash.url
    this.isLocal = hash.isLocal

    this.displayName = hash.displayName

    this.description = hash.description
    this.privacy = hash.privacy

    this.thumbnailPath = hash.thumbnailPath

    this.thumbnailUrl = this.thumbnailPath
      ? hash.thumbnailUrl || (absoluteAPIUrl + hash.thumbnailPath)
      : absoluteAPIUrl + '/client/assets/images/default-playlist.jpg'

    this.embedPath = hash.embedPath
    this.embedUrl = hash.embedUrl || (getAbsoluteEmbedUrl() + hash.embedPath)

    this.videosLength = hash.videosLength

    this.type = hash.type

    this.createdAt = new Date(hash.createdAt)
    this.updatedAt = new Date(hash.updatedAt)

    this.ownerAccount = hash.ownerAccount
    this.ownerBy = Actor.CREATE_BY_STRING(hash.ownerAccount.name, hash.ownerAccount.host)

    if (hash.videoChannel) {
      this.videoChannel = hash.videoChannel
      this.videoChannelBy = Actor.CREATE_BY_STRING(hash.videoChannel.name, hash.videoChannel.host)
    }

    this.privacy.label = retro3Translate(this.privacy.label, translations)

    if (this.type.id === VideoPlaylistType.WATCH_LATER) {
      this.displayName = retro3Translate(this.displayName, translations)
    }
  }
}
