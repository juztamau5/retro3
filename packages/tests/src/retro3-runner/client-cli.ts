/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { Retro3RunnerProcess } from '@tests/shared/retro3-runner-process.js'
import {
  cleanupTests,
  createSingleServer,
  Retro3Server,
  setAccessTokensToServers,
  setDefaultVideoChannel
} from '@retroai/retro3-server-commands'

describe('Test retro3-runner program client CLI', function () {
  let server: Retro3Server
  let retro3Runner: Retro3RunnerProcess

  before(async function () {
    this.timeout(120_000)

    server = await createSingleServer(1)

    await setAccessTokensToServers([ server ])
    await setDefaultVideoChannel([ server ])

    await server.config.enableRemoteTranscoding()

    retro3Runner = new Retro3RunnerProcess(server)
    await retro3Runner.runServer()
  })

  it('Should not have retro3 instance listed', async function () {
    const data = await retro3Runner.listRegisteredRetro3Instances()

    expect(data).to.not.contain(server.url)
  })

  it('Should register a new retro3 instance', async function () {
    const registrationToken = await server.runnerRegistrationTokens.getFirstRegistrationToken()

    await retro3Runner.registerRetro3Instance({
      registrationToken,
      runnerName: 'my super runner',
      runnerDescription: 'super description'
    })
  })

  it('Should list this new retro3 instance', async function () {
    const data = await retro3Runner.listRegisteredRetro3Instances()

    expect(data).to.contain(server.url)
    expect(data).to.contain('my super runner')
    expect(data).to.contain('super description')
  })

  it('Should still have the configuration after a restart', async function () {
    retro3Runner.kill()

    await retro3Runner.runServer()
  })

  it('Should unregister the retro3 instance', async function () {
    await retro3Runner.unregisterRetro3Instance({ runnerName: 'my super runner' })
  })

  it('Should not have retro3 instance listed', async function () {
    const data = await retro3Runner.listRegisteredRetro3Instances()

    expect(data).to.not.contain(server.url)
  })

  after(async function () {
    retro3Runner.kill()

    await cleanupTests([ server ])
  })
})
