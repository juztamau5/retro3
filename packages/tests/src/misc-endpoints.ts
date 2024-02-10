/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { writeJson } from 'fs-extra/esm'
import { join } from 'path'
import { HttpStatusCode, VideoPrivacy } from '@retroai/retro3-models'
import {
  cleanupTests,
  createSingleServer,
  makeGetRequest,
  Retro3Server,
  setAccessTokensToServers
} from '@retroai/retro3-server-commands'
import { expectLogDoesNotContain } from './shared/checks.js'

describe('Test misc endpoints', function () {
  let server: Retro3Server
  let wellKnownPath: string

  before(async function () {
    this.timeout(120000)

    server = await createSingleServer(1)

    await setAccessTokensToServers([ server ])

    wellKnownPath = server.getDirectoryPath('well-known')
  })

  describe('Test a well known endpoints', function () {

    it('Should get security.txt', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/security.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('SECURITY.md')
    })

    it('Should get nodeinfo', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/nodeinfo',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.links).to.be.an('array')
      expect(res.body.links).to.have.lengthOf(1)
      expect(res.body.links[0].rel).to.equal('http://nodeinfo.diaspora.software/ns/schema/2.0')
    })

    it('Should get dnt policy text', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/dnt-policy.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('http://www.w3.org/TR/tracking-dnt')
    })

    it('Should get dnt policy', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/dnt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.tracking).to.equal('N')
    })

    it('Should get change-password location', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/change-password',
        expectedStatus: HttpStatusCode.FOUND_302
      })

      expect(res.header.location).to.equal('/my-account/settings')
    })

    it('Should test webfinger', async function () {
      const resource = 'acct:retro3@' + server.host
      const accountUrl = server.url + '/accounts/retro3'

      const res = await makeGetRequest({
        url: server.url,
        path: '/.well-known/webfinger?resource=' + resource,
        expectedStatus: HttpStatusCode.OK_200
      })

      const data = res.body

      expect(data.subject).to.equal(resource)
      expect(data.aliases).to.contain(accountUrl)

      const self = data.links.find(l => l.rel === 'self')
      expect(self).to.exist
      expect(self.type).to.equal('application/activity+json')
      expect(self.href).to.equal(accountUrl)

      const remoteInteract = data.links.find(l => l.rel === 'http://ostatus.org/schema/1.0/subscribe')
      expect(remoteInteract).to.exist
      expect(remoteInteract.template).to.equal(server.url + '/remote-interaction?uri={uri}')
    })

    it('Should return 404 for non-existing files in /.well-known', async function () {
      await makeGetRequest({
        url: server.url,
        path: '/.well-known/non-existing-file',
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should return custom file from /.well-known', async function () {
      const filename = 'existing-file.json'

      await writeJson(join(wellKnownPath, filename), { iThink: 'therefore I am' })

      const { body } = await makeGetRequest({
        url: server.url,
        path: '/.well-known/' + filename,
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(body.iThink).to.equal('therefore I am')
    })
  })

  describe('Test classic static endpoints', function () {

    it('Should get robots.txt', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/robots.txt',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('User-agent')
    })

    it('Should get security.txt', async function () {
      await makeGetRequest({
        url: server.url,
        path: '/security.txt',
        expectedStatus: HttpStatusCode.MOVED_PERMANENTLY_301
      })
    })

    it('Should get nodeinfo', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/nodeinfo/2.0.json',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.body.software.name).to.equal('retro3')
      expect(res.body.usage.users.activeMonth).to.equal(1)
      expect(res.body.usage.users.activeHalfyear).to.equal(1)
    })
  })

  describe('Test bots endpoints', function () {

    it('Should get the empty sitemap', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/sitemap.xml',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(res.text).to.contain('<url><loc>' + server.url + '/about/instance</loc></url>')
    })

    it('Should get the empty cached sitemap', async function () {
      const res = await makeGetRequest({
        url: server.url,
        path: '/sitemap.xml',
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(res.text).to.contain('<url><loc>' + server.url + '/about/instance</loc></url>')
    })

    it('Should add videos, channel and accounts and get sitemap', async function () {
      this.timeout(35000)

      await server.videos.upload({ attributes: { name: 'video 1', nsfw: false } })
      await server.videos.upload({ attributes: { name: 'video 2', nsfw: false } })
      await server.videos.upload({ attributes: { name: 'video 3', privacy: VideoPrivacy.PRIVATE } })

      await server.channels.create({ attributes: { name: 'channel1', displayName: 'channel 1' } })
      await server.channels.create({ attributes: { name: 'channel2', displayName: 'channel 2' } })

      await server.users.create({ username: 'user1', password: 'password' })
      await server.users.create({ username: 'user2', password: 'password' })

      const res = await makeGetRequest({
        url: server.url,
        path: '/sitemap.xml?t=1', // avoid using cache
        expectedStatus: HttpStatusCode.OK_200
      })

      expect(res.text).to.contain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(res.text).to.contain('<url><loc>' + server.url + '/about/instance</loc></url>')

      expect(res.text).to.contain('<video:title>video 1</video:title>')
      expect(res.text).to.contain('<video:title>video 2</video:title>')
      expect(res.text).to.not.contain('<video:title>video 3</video:title>')

      expect(res.text).to.contain('<url><loc>' + server.url + '/c/channel1/videos</loc></url>')
      expect(res.text).to.contain('<url><loc>' + server.url + '/c/channel2/videos</loc></url>')

      expect(res.text).to.contain('<url><loc>' + server.url + '/a/user1/video-channels</loc></url>')
      expect(res.text).to.contain('<url><loc>' + server.url + '/a/user2/video-channels</loc></url>')
    })

    it('Should not fail with big title/description videos', async function () {
      const name = 'v'.repeat(115)

      await server.videos.upload({ attributes: { name, description: 'd'.repeat(2500), nsfw: false } })

      const res = await makeGetRequest({
        url: server.url,
        path: '/sitemap.xml?t=2', // avoid using cache
        expectedStatus: HttpStatusCode.OK_200
      })

      await expectLogDoesNotContain(server, 'Warning in sitemap generation')
      await expectLogDoesNotContain(server, 'Error in sitemap generation')

      expect(res.text).to.contain(`<video:title>${'v'.repeat(97)}...</video:title>`)
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
