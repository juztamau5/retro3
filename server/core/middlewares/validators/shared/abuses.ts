import { Response } from 'express'
import { AbuseModel } from '@server/models/abuse/abuse.js'
import { HttpStatusCode } from '@retroai/retro3-models'
import { forceNumber } from '@retroai/retro3-core-utils'

async function doesAbuseExist (abuseId: number | string, res: Response) {
  const abuse = await AbuseModel.loadByIdWithReporter(forceNumber(abuseId))

  if (!abuse) {
    res.fail({
      status: HttpStatusCode.NOT_FOUND_404,
      message: 'Abuse not found'
    })

    return false
  }

  res.locals.abuse = abuse
  return true
}

// ---------------------------------------------------------------------------

export {
  doesAbuseExist
}
