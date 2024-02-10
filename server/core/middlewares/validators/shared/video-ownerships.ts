import express from 'express'
import { VideoChangeOwnershipModel } from '@server/models/video/video-change-ownership.js'
import { forceNumber } from '@retroai/retro3-core-utils'
import { HttpStatusCode } from '@retroai/retro3-models'

async function doesChangeVideoOwnershipExist (idArg: number | string, res: express.Response) {
  const id = forceNumber(idArg)
  const videoChangeOwnership = await VideoChangeOwnershipModel.load(id)

  if (!videoChangeOwnership) {
    res.fail({
      status: HttpStatusCode.NOT_FOUND_404,
      message: 'Video change ownership not found'
    })
    return false
  }

  res.locals.videoChangeOwnership = videoChangeOwnership

  return true
}

export {
  doesChangeVideoOwnershipExist
}
