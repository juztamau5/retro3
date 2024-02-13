/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import {
  cleanupTests,
  createSingleServer,
  killallServers,
  Retro3Server,
  PluginsCommand,
  setAccessTokensToServers
} from '@retroai/retro3-server-commands'

describe.skip('Test plugin scripts', function () {
  let server: Retro3Server

  before(async function () {
    this.timeout(30000)

    server = await createSingleServer(1)
    await setAccessTokensToServers([ server ])
  })

  it('Should install a plugin from stateless CLI', async function () {
    this.timeout(60000)

    const packagePath = PluginsCommand.getPluginTestPath()

    await server.cli.execWithEnv(`npm run plugin:install -- --plugin-path ${packagePath}`)
  })

  it('Should install a theme from stateless CLI', async function () {
    this.timeout(60000)

    await server.cli.execWithEnv(`npm run plugin:install -- --npm-name retro3-theme-background-red`)
  })

  it('Should have the theme and the plugin registered when we restart retro3', async function () {
    this.timeout(30000)

    await killallServers([ server ])
    await server.run()

    const config = await server.config.getConfig()

    const plugin = config.plugin.registered
                         .find(p => p.name === 'test')
    expect(plugin).to.not.be.undefined

    const theme = config.theme.registered
                        .find(t => t.name === 'background-red')
    expect(theme).to.not.be.undefined
  })

  it('Should uninstall a plugin from stateless CLI', async function () {
    this.timeout(60000)

    await server.cli.execWithEnv(`npm run plugin:uninstall -- --npm-name retro3-plugin-test`)
  })

  it('Should have removed the plugin on another retro3 restart', async function () {
    this.timeout(30000)

    await killallServers([ server ])
    await server.run()

    const config = await server.config.getConfig()

    const plugin = config.plugin.registered
                         .find(p => p.name === 'test')
    expect(plugin).to.be.undefined
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
