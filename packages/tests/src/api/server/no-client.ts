import request from 'supertest'
import { HttpStatusCode } from '@retroai/retro3-models'
import { cleanupTests, createSingleServer, Retro3Server } from '@retroai/retro3-server-commands'

describe('Start and stop server without web client routes', function () {
  let server: Retro3Server

  before(async function () {
    this.timeout(30000)

    server = await createSingleServer(1, {}, { retro3Args: [ '--no-client' ] })
  })

  it('Should fail getting the client', function () {
    const req = request(server.url)
      .get('/')

    return req.expect(HttpStatusCode.NOT_FOUND_404)
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
