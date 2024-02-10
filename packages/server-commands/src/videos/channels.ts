import { Retro3Server } from '../server/server.js'

function setDefaultVideoChannel (servers: Retro3Server[]) {
  const tasks: Promise<any>[] = []

  for (const server of servers) {
    const p = server.users.getMyInfo()
      .then(user => { server.store.channel = user.videoChannels[0] })

    tasks.push(p)
  }

  return Promise.all(tasks)
}

async function setDefaultChannelAvatar (serversArg: Retro3Server | Retro3Server[], channelName: string = 'root_channel') {
  const servers = Array.isArray(serversArg)
    ? serversArg
    : [ serversArg ]

  for (const server of servers) {
    await server.channels.updateImage({ channelName, fixture: 'avatar.png', type: 'avatar' })
  }
}

export {
  setDefaultVideoChannel,
  setDefaultChannelAvatar
}
