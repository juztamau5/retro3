import { doJSONRequest } from '@server/helpers/requests.js'
import { ApplicationModel } from '@server/models/application/application.js'
import { compareSemVer } from '@retroai/retro3-core-utils'
import { JoinRetro3Versions } from '@retroai/retro3-models'
import { logger } from '../../helpers/logger.js'
import { CONFIG } from '../../initializers/config.js'
import { RETRO3_VERSION, SCHEDULER_INTERVALS_MS } from '../../initializers/constants.js'
import { Notifier } from '../notifier/index.js'
import { AbstractScheduler } from './abstract-scheduler.js'

export class Retro3VersionCheckScheduler extends AbstractScheduler {

  private static instance: AbstractScheduler

  protected schedulerIntervalMs = SCHEDULER_INTERVALS_MS.CHECK_RETRO3_VERSION

  private constructor () {
    super()
  }

  protected async internalExecute () {
    return this.checkLatestVersion()
  }

  private async checkLatestVersion () {
    if (CONFIG.RETRO3.CHECK_LATEST_VERSION.ENABLED === false) return

    logger.info('Checking latest retro3 version.')

    const { body } = await doJSONRequest<JoinRetro3Versions>(CONFIG.RETRO3.CHECK_LATEST_VERSION.URL)

    if (!body?.retro3?.latestVersion) {
      logger.warn('Cannot check latest retro3 version: body is invalid.', { body })
      return
    }

    const latestVersion = body.retro3.latestVersion
    const application = await ApplicationModel.load()

    // Already checked this version
    if (application.latestRetro3Version === latestVersion) return

    if (compareSemVer(RETRO3_VERSION, latestVersion) < 0) {
      application.latestRetro3Version = latestVersion
      await application.save()

      Notifier.Instance.notifyOfNewRetro3Version(application, latestVersion)
    }
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }
}
