import { VideoDetails, VideoPrivacy, VideoStreamingPlaylistType } from '@retroai/retro3-models'

function getAllPrivacies () {
  return [ VideoPrivacy.PUBLIC, VideoPrivacy.INTERNAL, VideoPrivacy.PRIVATE, VideoPrivacy.UNLISTED, VideoPrivacy.PASSWORD_PROTECTED ]
}

function getAllFiles (video: Partial<Pick<VideoDetails, 'files' | 'streamingPlaylists'>>) {
  const files = video.files

  const hls = getHLS(video)
  if (hls) return files.concat(hls.files)

  return files
}

function getHLS (video: Partial<Pick<VideoDetails, 'streamingPlaylists'>>) {
  return video.streamingPlaylists.find(p => p.type === VideoStreamingPlaylistType.HLS)
}

export {
  getAllPrivacies,
  getAllFiles,
  getHLS
}
