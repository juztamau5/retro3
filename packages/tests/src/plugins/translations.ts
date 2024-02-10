/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import {
  cleanupTests,
  createSingleServer,
  Retro3Server,
  PluginsCommand,
  setAccessTokensToServers
} from '@retroai/retro3-server-commands'

describe('Test plugin translations', function () {
  let server: Retro3Server
  let command: PluginsCommand

  before(async function () {
    this.timeout(30000)

    server = await createSingleServer(1)
    await setAccessTokensToServers([ server ])

    command = server.plugins

    await command.install({ path: PluginsCommand.getPluginTestPath() })
    await command.install({ path: PluginsCommand.getPluginTestPath('-filter-translations') })
  })

  it('Should not have translations for locale pt', async function () {
    const body = await command.getTranslations({ locale: 'pt' })

    expect(body).to.deep.equal({})
  })

  it('Should have translations for locale fr', async function () {
    const body = await command.getTranslations({ locale: 'fr-FR' })

    expect(body).to.deep.equal({
      'retro3-plugin-test': {
        Hi: 'Coucou'
      },
      'retro3-plugin-test-filter-translations': {
        'Hello world': 'Bonjour le monde'
      }
    })
  })

  it('Should have translations of locale it', async function () {
    const body = await command.getTranslations({ locale: 'it-IT' })

    expect(body).to.deep.equal({
      'retro3-plugin-test-filter-translations': {
        'Hello world': 'Ciao, mondo!'
      }
    })
  })

  it('Should remove the plugin and remove the locales', async function () {
    await command.uninstall({ npmName: 'retro3-plugin-test-filter-translations' })

    {
      const body = await command.getTranslations({ locale: 'fr-FR' })

      expect(body).to.deep.equal({
        'retro3-plugin-test': {
          Hi: 'Coucou'
        }
      })
    }

    {
      const body = await command.getTranslations({ locale: 'it-IT' })

      expect(body).to.deep.equal({})
    }
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
