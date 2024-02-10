import express from 'express'
import { forceNumber } from '@retroai/retro3-core-utils'
import { VideosExistInPlaylists } from '@retroai/retro3-models'
import { uuidToShort } from '@retroai/retro3-node-utils'
import { asyncMiddleware, authenticate } from '../../../middlewares/index.js'
import { doVideosInPlaylistExistValidator } from '../../../middlewares/validators/videos/video-playlists.js'
import { VideoPlaylistModel } from '../../../models/video/video-playlist.js'

const myVideoPlaylistsRouter = express.Router()

myVideoPlaylistsRouter.get('/me/video-playlists/videos-exist',
  authenticate,
  doVideosInPlaylistExistValidator,
  asyncMiddleware(doVideosInPlaylistExist)
)

// ---------------------------------------------------------------------------

export {
  myVideoPlaylistsRouter
}

// ---------------------------------------------------------------------------

async function doVideosInPlaylistExist (req: express.Request, res: express.Response) {
  const videoIds = req.query.videoIds.map(i => forceNumber(i))
  const user = res.locals.oauth.token.User

  const results = await VideoPlaylistModel.listPlaylistSummariesOf(user.Account.id, videoIds)

  const existObject: VideosExistInPlaylists = {}

  for (const videoId of videoIds) {
    existObject[videoId] = []
  }

  for (const result of results) {
    for (const element of result.VideoPlaylistElements) {
      existObject[element.videoId].push({
        playlistElementId: element.id,
        playlistId: result.id,
        playlistDisplayName: result.name,
        playlistShortUUID: uuidToShort(result.uuid),
        startTimestamp: element.startTimestamp,
        stopTimestamp: element.stopTimestamp
      })
    }
  }

  return res.json(existObject)
}
