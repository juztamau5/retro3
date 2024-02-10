/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { pathExists } from 'fs-extra/esm'
import { readdir } from 'fs/promises'
import { Account, VideoChannel } from '@retroai/retro3-models'
import { Retro3Server } from '@retroai/retro3-server-commands'

async function expectChannelsFollows (options: {
  server: Retro3Server
  handle: string
  followers: number
  following: number
}) {
  const { server } = options
  const { data } = await server.channels.list()

  return expectActorFollow({ ...options, data })
}

async function expectAccountFollows (options: {
  server: Retro3Server
  handle: string
  followers: number
  following: number
}) {
  const { server } = options
  const { data } = await server.accounts.list()

  return expectActorFollow({ ...options, data })
}

async function checkActorFilesWereRemoved (filename: string, server: Retro3Server) {
  for (const directory of [ 'avatars' ]) {
    const directoryPath = server.getDirectoryPath(directory)

    const directoryExists = await pathExists(directoryPath)
    expect(directoryExists).to.be.true

    const files = await readdir(directoryPath)
    for (const file of files) {
      expect(file).to.not.contain(filename)
    }
  }
}

export {
  expectAccountFollows,
  expectChannelsFollows,
  checkActorFilesWereRemoved
}

// ---------------------------------------------------------------------------

function expectActorFollow (options: {
  server: Retro3Server
  data: (Account | VideoChannel)[]
  handle: string
  followers: number
  following: number
}) {
  const { server, data, handle, followers, following } = options

  const actor = data.find(a => a.name + '@' + a.host === handle)
  const message = `${handle} on ${server.url}`

  expect(actor, message).to.exist
  expect(actor.followersCount).to.equal(followers, message)
  expect(actor.followingCount).to.equal(following, message)
}
