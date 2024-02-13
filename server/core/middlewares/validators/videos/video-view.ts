import express from 'express'
import { body, param } from 'express-validator'
import { HttpStatusCode } from '@retroai/retro3-models'
import { isVideoTimeValid } from '@server/helpers/custom-validators/video-view.js'
import { getCachedVideoDuration } from '@server/lib/video.js'
import { LocalVideoViewerModel } from '@server/models/view/local-video-viewer.js'
import { isIdValid, isIntOrNull, toIntOrNull } from '../../../helpers/custom-validators/misc.js'
import { areValidationErrors, doesVideoExist, isValidVideoIdParam } from '../shared/index.js'

const getVideoLocalViewerValidator = [
  param('localViewerId')
    .custom(isIdValid),

  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (areValidationErrors(req, res)) return

    const localViewer = await LocalVideoViewerModel.loadFullById(+req.params.localViewerId)
    if (!localViewer) {
      return res.fail({
        status: HttpStatusCode.NOT_FOUND_404,
        message: 'Local viewer not found'
      })
    }

    res.locals.localViewerFull = localViewer

    return next()
  }
]

const videoViewValidator = [
  isValidVideoIdParam('videoId'),

  body('currentTime')
    .customSanitizer(toIntOrNull)
    .custom(isIntOrNull),

  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (areValidationErrors(req, res)) return
    if (!await doesVideoExist(req.params.videoId, res, 'only-immutable-attributes')) return

    const video = res.locals.onlyImmutableVideo
    const { duration } = await getCachedVideoDuration(video.id)

    if (!isVideoTimeValid(req.body.currentTime, duration)) {
      return res.fail({
        status: HttpStatusCode.BAD_REQUEST_400,
        message: 'Current time is invalid'
      })
    }

    return next()
  }
]

// ---------------------------------------------------------------------------

export {
  videoViewValidator,
  getVideoLocalViewerValidator
}
