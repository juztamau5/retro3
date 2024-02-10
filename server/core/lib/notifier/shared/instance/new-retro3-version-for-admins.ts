import { logger } from '@server/helpers/logger.js'
import { UserModel } from '@server/models/user/user.js'
import { UserNotificationModel } from '@server/models/user/user-notification.js'
import { MApplication, MUserDefault, MUserWithNotificationSetting, UserNotificationModelForApi } from '@server/types/models/index.js'
import { UserNotificationType, UserRight } from '@retroai/retro3-models'
import { AbstractNotification } from '../common/abstract-notification.js'

export type NewRetro3VersionForAdminsPayload = {
  application: MApplication
  latestVersion: string
}

export class NewRetro3VersionForAdmins extends AbstractNotification <NewRetro3VersionForAdminsPayload> {
  private admins: MUserDefault[]

  async prepare () {
    // Use the debug right to know who is an administrator
    this.admins = await UserModel.listWithRight(UserRight.MANAGE_DEBUG)
  }

  log () {
    logger.info('Notifying %s admins of new retro3 version %s.', this.admins.length, this.payload.latestVersion)
  }

  getSetting (user: MUserWithNotificationSetting) {
    return user.NotificationSetting.newRetro3Version
  }

  getTargetUsers () {
    return this.admins
  }

  createNotification (user: MUserWithNotificationSetting) {
    const notification = UserNotificationModel.build<UserNotificationModelForApi>({
      type: UserNotificationType.NEW_RETRO3_VERSION,
      userId: user.id,
      applicationId: this.payload.application.id
    })
    notification.Application = this.payload.application

    return notification
  }

  createEmail (to: string) {
    return {
      to,
      template: 'retro3-version-new',
      subject: `A new retro3 version is available: ${this.payload.latestVersion}`,
      locals: {
        latestVersion: this.payload.latestVersion
      }
    }
  }
}
