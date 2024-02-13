/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { checkBadCountPagination, checkBadSortPagination, checkBadStartPagination } from '@tests/shared/checks.js'
import { HttpStatusCode } from '@retroai/retro3-models'
import { cleanupTests, createSingleServer, Retro3Server } from '@retroai/retro3-server-commands'

describe('Test accounts API validators', function () {
  const path = '/api/v1/accounts/'
  let server: Retro3Server

  // ---------------------------------------------------------------

  before(async function () {
    this.timeout(30000)

    server = await createSingleServer(1)
  })

  describe('When listing accounts', function () {
    it('Should fail with a bad start pagination', async function () {
      await checkBadStartPagination(server.url, path, server.accessToken)
    })

    it('Should fail with a bad count pagination', async function () {
      await checkBadCountPagination(server.url, path, server.accessToken)
    })

    it('Should fail with an incorrect sort', async function () {
      await checkBadSortPagination(server.url, path, server.accessToken)
    })
  })

  describe('When getting an account', function () {

    it('Should return 404 with a non existing name', async function () {
      await server.accounts.get({ accountName: 'arfaze', expectedStatus: HttpStatusCode.NOT_FOUND_404 })
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
