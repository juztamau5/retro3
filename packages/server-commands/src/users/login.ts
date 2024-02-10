import { Retro3Server } from '../server/server.js'

function setAccessTokensToServers (servers: Retro3Server[]) {
  const tasks: Promise<any>[] = []

  for (const server of servers) {
    const p = server.login.getAccessToken()
                                 .then(t => { server.accessToken = t })
    tasks.push(p)
  }

  return Promise.all(tasks)
}

// ---------------------------------------------------------------------------

export {
  setAccessTokensToServers
}
