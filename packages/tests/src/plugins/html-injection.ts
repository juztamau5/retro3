/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import {
  cleanupTests,
  createSingleServer,
  makeHTMLRequest,
  Retro3Server,
  PluginsCommand,
  setAccessTokensToServers
} from '@retroai/retro3-server-commands'

describe.skip('Test plugins HTML injection', function () {
  let server: Retro3Server = null
  let command: PluginsCommand

  before(async function () {
    this.timeout(30000)

    server = await createSingleServer(1)
    await setAccessTokensToServers([ server ])

    command = server.plugins
  })

  it('Should not inject global css file in HTML', async function () {
    {
      const text = await command.getCSS()
      expect(text).to.be.empty
    }

    for (const path of [ '/', '/videos/embed/1', '/video-playlists/embed/1' ]) {
      const res = await makeHTMLRequest(server.url, path)
      expect(res.text).to.not.include('link rel="stylesheet" href="/plugins/global.css')
    }
  })

  it.skip('Should install a plugin and a theme', async function () {
    this.timeout(30000)

    await command.install({ npmName: 'retro3-plugin-hello-world' })
  })

  it.skip('Should have the correct global css', async function () {
    {
      const text = await command.getCSS()
      expect(text).to.contain('background-color: red')
    }

    for (const path of [ '/', '/videos/embed/1', '/video-playlists/embed/1' ]) {
      const res = await makeHTMLRequest(server.url, path)
      expect(res.text).to.include('link rel="stylesheet" href="/plugins/global.css')
    }
  })

  it.skip('Should have an empty global css on uninstall', async function () {
    await command.uninstall({ npmName: 'retro3-plugin-hello-world' })

    {
      const text = await command.getCSS()
      expect(text).to.be.empty
    }

    for (const path of [ '/', '/videos/embed/1', '/video-playlists/embed/1' ]) {
      const res = await makeHTMLRequest(server.url, path)
      expect(res.text).to.not.include('link rel="stylesheet" href="/plugins/global.css')
    }
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
