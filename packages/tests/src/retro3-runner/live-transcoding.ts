/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */
import { expect } from 'chai'
import { wait } from '@retroai/retro3-core-utils'
import { HttpStatusCode, VideoPrivacy } from '@retroai/retro3-models'
import { areMockObjectStorageTestsDisabled } from '@retroai/retro3-node-utils'
import {
  cleanupTests,
  createMultipleServers,
  doubleFollow,
  findExternalSavedVideo,
  makeRawRequest,
  ObjectStorageCommand,
  Retro3Server,
  setAccessTokensToServers,
  setDefaultVideoChannel,
  stopFfmpeg,
  waitJobs,
  waitUntilLivePublishedOnAllServers,
  waitUntilLiveWaitingOnAllServers
} from '@retroai/retro3-server-commands'
import { expectStartWith } from '@tests/shared/checks.js'
import { checkRetro3RunnerCacheIsEmpty } from '@tests/shared/directories.js'
import { testLiveVideoResolutions } from '@tests/shared/live.js'
import { Retro3RunnerProcess } from '@tests/shared/retro3-runner-process.js'
import { SQLCommand } from '@tests/shared/sql-command.js'

describe('Test Live transcoding in retro3-runner program', function () {
  let servers: Retro3Server[] = []
  let retro3Runner: Retro3RunnerProcess
  let sqlCommandServer1: SQLCommand

  function runSuite (options: {
    objectStorage?: ObjectStorageCommand
  } = {}) {
    const { objectStorage } = options

    it('Should enable transcoding without additional resolutions', async function () {
      this.timeout(120000)

      const { video } = await servers[0].live.quickCreate({ permanentLive: true, saveReplay: false, privacy: VideoPrivacy.PUBLIC })

      const ffmpegCommand = await servers[0].live.sendRTMPStreamInVideo({ videoId: video.uuid })
      await waitUntilLivePublishedOnAllServers(servers, video.uuid)
      await waitJobs(servers)

      await testLiveVideoResolutions({
        originServer: servers[0],
        sqlCommand: sqlCommandServer1,
        servers,
        liveVideoId: video.uuid,
        resolutions: [ 720, 480, 360, 240, 144 ],
        objectStorage,
        transcoded: true
      })

      await stopFfmpeg(ffmpegCommand)

      await waitUntilLiveWaitingOnAllServers(servers, video.uuid)
      await servers[0].videos.remove({ id: video.id })
    })

    it('Should transcode audio only RTMP stream', async function () {
      this.timeout(120000)

      const { video } = await servers[0].live.quickCreate({ permanentLive: true, saveReplay: false, privacy: VideoPrivacy.UNLISTED })

      const ffmpegCommand = await servers[0].live.sendRTMPStreamInVideo({ videoId: video.uuid, fixtureName: 'video_short_no_audio.mp4' })
      await waitUntilLivePublishedOnAllServers(servers, video.uuid)
      await waitJobs(servers)

      await stopFfmpeg(ffmpegCommand)

      await waitUntilLiveWaitingOnAllServers(servers, video.uuid)
      await servers[0].videos.remove({ id: video.id })
    })

    it('Should save a replay', async function () {
      this.timeout(240000)

      const { video } = await servers[0].live.quickCreate({ permanentLive: true, saveReplay: true })

      const ffmpegCommand = await servers[0].live.sendRTMPStreamInVideo({ videoId: video.uuid })
      await waitUntilLivePublishedOnAllServers(servers, video.uuid)

      await testLiveVideoResolutions({
        originServer: servers[0],
        sqlCommand: sqlCommandServer1,
        servers,
        liveVideoId: video.uuid,
        resolutions: [ 720, 480, 360, 240, 144 ],
        objectStorage,
        transcoded: true
      })

      await stopFfmpeg(ffmpegCommand)

      await waitUntilLiveWaitingOnAllServers(servers, video.uuid)
      await waitJobs(servers)

      const session = await servers[0].live.findLatestSession({ videoId: video.uuid })
      expect(session.endingProcessed).to.be.true
      expect(session.endDate).to.exist
      expect(session.saveReplay).to.be.true

      const videoLiveDetails = await servers[0].videos.get({ id: video.uuid })
      const replay = await findExternalSavedVideo(servers[0], videoLiveDetails)

      for (const server of servers) {
        const video = await server.videos.get({ id: replay.uuid })

        expect(video.files).to.have.lengthOf(0)
        expect(video.streamingPlaylists).to.have.lengthOf(1)

        const files = video.streamingPlaylists[0].files
        expect(files).to.have.lengthOf(5)

        for (const file of files) {
          if (objectStorage) {
            expectStartWith(file.fileUrl, objectStorage.getMockPlaylistBaseUrl())
          }

          await makeRawRequest({ url: file.fileUrl, expectedStatus: HttpStatusCode.OK_200 })
        }
      }
    })
  }

  before(async function () {
    this.timeout(120_000)

    servers = await createMultipleServers(2)

    await setAccessTokensToServers(servers)
    await setDefaultVideoChannel(servers)

    await doubleFollow(servers[0], servers[1])

    sqlCommandServer1 = new SQLCommand(servers[0])

    await servers[0].config.enableRemoteTranscoding()
    await servers[0].config.enableTranscoding({ hls: true, webVideo: true, with0p: true })
    await servers[0].config.enableLive({ allowReplay: true, resolutions: 'max', transcoding: true })

    const registrationToken = await servers[0].runnerRegistrationTokens.getFirstRegistrationToken()

    retro3Runner = new Retro3RunnerProcess(servers[0])
    await retro3Runner.runServer()
    await retro3Runner.registerRetro3Instance({ registrationToken, runnerName: 'runner' })
  })

  describe('With lives on local filesystem storage', function () {

    before(async function () {
      await servers[0].config.enableTranscoding({ webVideo: true, hls: false, with0p: true })
    })

    runSuite()
  })

  describe('With lives on object storage', function () {
    if (areMockObjectStorageTestsDisabled()) return

    const objectStorage = new ObjectStorageCommand()

    before(async function () {
      await objectStorage.prepareDefaultMockBuckets()

      await servers[0].kill()

      await servers[0].run(objectStorage.getDefaultMockConfig())

      // Wait for retro3 runner socket reconnection
      await wait(1500)
    })

    runSuite({ objectStorage })

    after(async function () {
      await objectStorage.cleanupMock()
    })
  })

  describe('Check cleanup', function () {

    it('Should have an empty cache directory', async function () {
      await checkRetro3RunnerCacheIsEmpty(retro3Runner)
    })
  })

  after(async function () {
    if (retro3Runner) {
      await retro3Runner.unregisterRetro3Instance({ runnerName: 'runner' })
      retro3Runner.kill()
    }

    if (sqlCommandServer1) await sqlCommandServer1.cleanup()

    await cleanupTests(servers)
  })
})
