/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { MockInstancesIndex } from '@tests/shared/mock-servers/index.js'
import { wait } from '@retroai/retro3-core-utils'
import { cleanupTests, createMultipleServers, Retro3Server, setAccessTokensToServers, waitJobs } from '@retroai/retro3-server-commands'

async function checkFollow (follower: Retro3Server, following: Retro3Server, exists: boolean) {
  {
    const body = await following.follows.getFollowers({ start: 0, count: 5, sort: '-createdAt' })
    const follow = body.data.find(f => f.follower.host === follower.host && f.state === 'accepted')

    if (exists === true) expect(follow, `Follower ${follower.url} should exist on ${following.url}`).to.exist
    else expect(follow, `Follower ${follower.url} should not exist on ${following.url}`).to.be.undefined
  }

  {
    const body = await follower.follows.getFollowings({ start: 0, count: 5, sort: '-createdAt' })
    const follow = body.data.find(f => f.following.host === following.host && f.state === 'accepted')

    if (exists === true) expect(follow, `Following ${following.url} should exist on ${follower.url}`).to.exist
    else expect(follow, `Following ${following.url} should not exist on ${follower.url}`).to.be.undefined
  }
}

async function server1Follows2 (servers: Retro3Server[]) {
  await servers[0].follows.follow({ hosts: [ servers[1].host ] })

  await waitJobs(servers)
}

async function resetFollows (servers: Retro3Server[]) {
  try {
    await servers[0].follows.unfollow({ target: servers[1] })
    await servers[1].follows.unfollow({ target: servers[0] })
  } catch { /* empty */
  }

  await waitJobs(servers)

  await checkFollow(servers[0], servers[1], false)
  await checkFollow(servers[1], servers[0], false)
}

describe('Test auto follows', function () {
  let servers: Retro3Server[] = []

  before(async function () {
    this.timeout(120000)

    servers = await createMultipleServers(3)

    // Get the access tokens
    await setAccessTokensToServers(servers)
  })

  describe('Auto follow back', function () {

    it('Should not auto follow back if the option is not enabled', async function () {
      this.timeout(30000)

      await server1Follows2(servers)

      await checkFollow(servers[0], servers[1], true)
      await checkFollow(servers[1], servers[0], false)

      await resetFollows(servers)
    })

    it('Should auto follow back on auto accept if the option is enabled', async function () {
      this.timeout(15000)

      const config = {
        followings: {
          instance: {
            autoFollowBack: { enabled: true }
          }
        }
      }
      await servers[1].config.updateCustomSubConfig({ newConfig: config })

      await server1Follows2(servers)

      await checkFollow(servers[0], servers[1], true)
      await checkFollow(servers[1], servers[0], true)

      await resetFollows(servers)
    })

    it('Should wait the acceptation before auto follow back', async function () {
      this.timeout(30000)

      const config = {
        followings: {
          instance: {
            autoFollowBack: { enabled: true }
          }
        },
        followers: {
          instance: {
            manualApproval: true
          }
        }
      }
      await servers[1].config.updateCustomSubConfig({ newConfig: config })

      await server1Follows2(servers)

      await checkFollow(servers[0], servers[1], false)
      await checkFollow(servers[1], servers[0], false)

      await servers[1].follows.acceptFollower({ follower: 'retro3@' + servers[0].host })
      await waitJobs(servers)

      await checkFollow(servers[0], servers[1], true)
      await checkFollow(servers[1], servers[0], true)

      await resetFollows(servers)

      config.followings.instance.autoFollowBack.enabled = false
      config.followers.instance.manualApproval = false
      await servers[1].config.updateCustomSubConfig({ newConfig: config })
    })
  })

  describe('Auto follow index', function () {
    const instanceIndexServer = new MockInstancesIndex()
    let port: number

    before(async function () {
      port = await instanceIndexServer.initialize()
    })

    it('Should not auto follow index if the option is not enabled', async function () {
      this.timeout(30000)

      await wait(5000)
      await waitJobs(servers)

      await checkFollow(servers[0], servers[1], false)
      await checkFollow(servers[1], servers[0], false)
    })

    it('Should auto follow the index', async function () {
      this.timeout(30000)

      instanceIndexServer.addInstance(servers[1].host)

      const config = {
        followings: {
          instance: {
            autoFollowIndex: {
              indexUrl: `http://127.0.0.1:${port}/api/v1/instances/hosts`,
              enabled: true
            }
          }
        }
      }
      await servers[0].config.updateCustomSubConfig({ newConfig: config })

      await wait(5000)
      await waitJobs(servers)

      await checkFollow(servers[0], servers[1], true)

      await resetFollows(servers)
    })

    it('Should follow new added instances in the index but not old ones', async function () {
      this.timeout(30000)

      instanceIndexServer.addInstance(servers[2].host)

      await wait(5000)
      await waitJobs(servers)

      await checkFollow(servers[0], servers[1], false)
      await checkFollow(servers[0], servers[2], true)
    })

    after(async function () {
      await instanceIndexServer.terminate()
    })
  })

  after(async function () {
    await cleanupTests(servers)
  })
})
