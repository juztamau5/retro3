/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { wait } from '@retroai/retro3-core-utils'
import { PluginType, UserNotification, UserNotificationType } from '@retroai/retro3-models'
import { cleanupTests, Retro3Server } from '@retroai/retro3-server-commands'
import { MockSmtpServer } from '@tests/shared/mock-servers/mock-email.js'
import { MockJoinRetro3Versions } from '@tests/shared/mock-servers/mock-joinretro3-versions.js'
import { CheckerBaseParams, prepareNotificationsTest, checkNewRetro3Version, checkNewPluginVersion } from '@tests/shared/notifications.js'
import { SQLCommand } from '@tests/shared/sql-command.js'

describe.skip('Test admin notifications', function () {
  let server: Retro3Server
  let sqlCommand: SQLCommand
  let userNotifications: UserNotification[] = []
  let adminNotifications: UserNotification[] = []
  let emails: object[] = []
  let baseParams: CheckerBaseParams
  let joinRetro3Server: MockJoinRetro3Versions

  before(async function () {
    this.timeout(120000)

    joinRetro3Server = new MockJoinRetro3Versions()
    const port = await joinRetro3Server.initialize()

    const config = {
      retro3: {
        check_latest_version: {
          enabled: true,
          url: `http://127.0.0.1:${port}/versions.json`
        }
      },
      plugins: {
        index: {
          enabled: true,
          check_latest_versions_interval: '3 seconds'
        }
      }
    }

    const res = await prepareNotificationsTest(1, config)
    emails = res.emails
    server = res.servers[0]

    userNotifications = res.userNotifications
    adminNotifications = res.adminNotifications

    baseParams = {
      server,
      emails,
      socketNotifications: adminNotifications,
      token: server.accessToken
    }

    await server.plugins.install({ npmName: 'retro3-plugin-hello-world' })
    await server.plugins.install({ npmName: 'retro3-theme-background-red' })

    sqlCommand = new SQLCommand(server)
  })

  describe('Latest retro3 version notification', function () {

    it('Should not send a notification to admins if there is no new version', async function () {
      this.timeout(30000)

      joinRetro3Server.setLatestVersion('1.4.2')

      await wait(4500)
      await checkNewRetro3Version({ ...baseParams, latestVersion: '1.4.2', checkType: 'absence' })
    })

    it('Should send a notification to admins on new version', async function () {
      this.timeout(30000)

      joinRetro3Server.setLatestVersion('15.4.2')

      await wait(4500)
      await checkNewRetro3Version({ ...baseParams, latestVersion: '15.4.2', checkType: 'presence' })
    })

    it('Should not send the same notification to admins', async function () {
      this.timeout(30000)

      await wait(4500)
      expect(adminNotifications.filter(n => n.type === UserNotificationType.NEW_RETRO3_VERSION)).to.have.lengthOf(1)
    })

    it('Should not have sent a notification to users', async function () {
      this.timeout(30000)

      expect(userNotifications.filter(n => n.type === UserNotificationType.NEW_RETRO3_VERSION)).to.have.lengthOf(0)
    })

    it('Should send a new notification after a new release', async function () {
      this.timeout(30000)

      joinRetro3Server.setLatestVersion('15.4.3')

      await wait(4500)
      await checkNewRetro3Version({ ...baseParams, latestVersion: '15.4.3', checkType: 'presence' })
      expect(adminNotifications.filter(n => n.type === UserNotificationType.NEW_RETRO3_VERSION)).to.have.lengthOf(2)
    })
  })

  describe('Latest plugin version notification', function () {

    it('Should not send a notification to admins if there is no new plugin version', async function () {
      this.timeout(30000)

      await wait(6000)
      await checkNewPluginVersion({ ...baseParams, pluginType: PluginType.PLUGIN, pluginName: 'hello-world', checkType: 'absence' })
    })

    it('Should send a notification to admins on new plugin version', async function () {
      this.timeout(30000)

      await sqlCommand.setPluginVersion('hello-world', '0.0.1')
      await sqlCommand.setPluginLatestVersion('hello-world', '0.0.1')
      await wait(6000)

      await checkNewPluginVersion({ ...baseParams, pluginType: PluginType.PLUGIN, pluginName: 'hello-world', checkType: 'presence' })
    })

    it('Should not send the same notification to admins', async function () {
      this.timeout(30000)

      await wait(6000)

      expect(adminNotifications.filter(n => n.type === UserNotificationType.NEW_PLUGIN_VERSION)).to.have.lengthOf(1)
    })

    it('Should not have sent a notification to users', async function () {
      expect(userNotifications.filter(n => n.type === UserNotificationType.NEW_PLUGIN_VERSION)).to.have.lengthOf(0)
    })

    it('Should send a new notification after a new plugin release', async function () {
      this.timeout(30000)

      await sqlCommand.setPluginVersion('hello-world', '0.0.1')
      await sqlCommand.setPluginLatestVersion('hello-world', '0.0.1')
      await wait(6000)

      expect(adminNotifications.filter(n => n.type === UserNotificationType.NEW_RETRO3_VERSION)).to.have.lengthOf(2)
    })
  })

  after(async function () {
    MockSmtpServer.Instance.kill()

    await sqlCommand.cleanup()
    await cleanupTests([ server ])
  })
})
