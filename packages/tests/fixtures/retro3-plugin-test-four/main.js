async function register ({
  Retro3Helpers,
  registerHook,
  getRouter
}) {
  const logger = Retro3Helpers.logger

  logger.info('Hello world from plugin four')

  {
    const username = 'root'
    const results = await Retro3Helpers.database.query(
      'SELECT "email" from "user" WHERE "username" = $username',
      {
        type: 'SELECT',
        bind: { username }
      }
    )

    logger.info('root email is ' + results[0]['email'])
  }

  {
    registerHook({
      target: 'action:api.video.viewed',
      handler: async ({ video }) => {
        const videoFromDB1 = await Retro3Helpers.videos.loadByUrl(video.url)
        const videoFromDB2 = await Retro3Helpers.videos.loadByIdOrUUID(video.id)
        const videoFromDB3 = await Retro3Helpers.videos.loadByIdOrUUID(video.uuid)

        if (videoFromDB1.uuid !== videoFromDB2.uuid || videoFromDB2.uuid !== videoFromDB3.uuid) return

        logger.info('video from DB uuid is %s.', videoFromDB1.uuid)

        await Retro3Helpers.videos.removeVideo(video.id)

        logger.info('Video deleted by plugin four.')
      }
    })
  }

  {
    const serverActor = await Retro3Helpers.server.getServerActor()
    logger.info('server actor name is %s', serverActor.preferredUsername)
  }

  {
    logger.info('server url is %s', Retro3Helpers.config.getWebserverUrl())
  }

  {
    const actions = {
      blockServer,
      unblockServer,
      blockAccount,
      unblockAccount,
      blacklist,
      unblacklist
    }

    const router = getRouter()
    router.post('/commander', async (req, res) => {
      try {
        await actions[req.body.command](Retro3Helpers, req.body)

        res.sendStatus(204)
      } catch (err) {
        logger.error('Error in commander.', { err })
        res.sendStatus(500)
      }
    })

    router.get('/server-config', async (req, res) => {
      const serverConfig = await Retro3Helpers.config.getServerConfig()

      return res.json({ serverConfig })
    })

    router.get('/server-listening-config', async (req, res) => {
      const config = await Retro3Helpers.config.getServerListeningConfig()

      return res.json({ config })
    })

    router.get('/static-route', async (req, res) => {
      const staticRoute = Retro3Helpers.plugin.getBaseStaticRoute()

      return res.json({ staticRoute })
    })

    router.get('/router-route', async (req, res) => {
      const routerRoute = Retro3Helpers.plugin.getBaseRouterRoute()

      return res.json({ routerRoute })
    })

    router.get('/user/:id', async (req, res) => {
      const user = await Retro3Helpers.user.loadById(req.params.id)
      if (!user) return res.status(404).end()

      return res.json({
        username: user.username
      })
    })

    router.get('/user', async (req, res) => {
      const user = await Retro3Helpers.user.getAuthUser(res)
      if (!user) return res.sendStatus(404)

      const isAdmin = user.role === 0
      const isModerator = user.role === 1
      const isUser = user.role === 2

      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.Account.name,
        isAdmin,
        isModerator,
        isUser
      })
    })

    router.get('/video-files/:id', async (req, res) => {
      const details = await Retro3Helpers.videos.getFiles(req.params.id)
      if (!details) return res.sendStatus(404)

      return res.json(details)
    })

    router.get('/ffprobe', async (req, res) => {
      const result = await Retro3Helpers.videos.ffprobe(req.query.path)
      if (!result) return res.sendStatus(404)

      return res.json(result)
    })

    router.post('/send-notification', async (req, res) => {
      Retro3Helpers.socket.sendNotification(req.body.userId, {
        type: 1,
        userId: req.body.userId
      })

      return res.sendStatus(201)
    })

    router.post('/send-video-live-new-state/:uuid', async (req, res) => {
      const video = await Retro3Helpers.videos.loadByIdOrUUID(req.params.uuid)
      Retro3Helpers.socket.sendVideoLiveNewState(video)

      return res.sendStatus(201)
    })
  }

}

async function unregister () {
  return
}

module.exports = {
  register,
  unregister
}

// ###########################################################################

async function blockServer (Retro3Helpers, body) {
  const serverActor = await Retro3Helpers.server.getServerActor()

  await Retro3Helpers.moderation.blockServer({ byAccountId: serverActor.Account.id, hostToBlock: body.hostToBlock })
}

async function unblockServer (Retro3Helpers, body) {
  const serverActor = await Retro3Helpers.server.getServerActor()

  await Retro3Helpers.moderation.unblockServer({ byAccountId: serverActor.Account.id, hostToUnblock: body.hostToUnblock })
}

async function blockAccount (Retro3Helpers, body) {
  const serverActor = await Retro3Helpers.server.getServerActor()

  await Retro3Helpers.moderation.blockAccount({ byAccountId: serverActor.Account.id, handleToBlock: body.handleToBlock })
}

async function unblockAccount (Retro3Helpers, body) {
  const serverActor = await Retro3Helpers.server.getServerActor()

  await Retro3Helpers.moderation.unblockAccount({ byAccountId: serverActor.Account.id, handleToUnblock: body.handleToUnblock })
}

async function blacklist (Retro3Helpers, body) {
  await Retro3Helpers.moderation.blacklistVideo({
    videoIdOrUUID: body.videoUUID,
    createOptions: body
  })
}

async function unblacklist (Retro3Helpers, body) {
  await Retro3Helpers.moderation.unblacklistVideo({ videoIdOrUUID: body.videoUUID })
}
