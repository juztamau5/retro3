/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { expect } from 'chai'
import { pathExists } from 'fs-extra/esm'
import { readdir } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import { Retro3Server } from '@retroai/retro3-server-commands'
import { Retro3RunnerProcess } from './retro3-runner-process.js'

export async function checkTmpIsEmpty (server: Retro3Server) {
  await checkDirectoryIsEmpty(server, 'tmp', [ 'plugins-global.css', 'hls', 'resumable-uploads' ])

  if (await pathExists(server.getDirectoryPath('tmp/hls'))) {
    await checkDirectoryIsEmpty(server, 'tmp/hls')
  }
}

export async function checkPersistentTmpIsEmpty (server: Retro3Server) {
  await checkDirectoryIsEmpty(server, 'tmp-persistent')
}

export async function checkDirectoryIsEmpty (server: Retro3Server, directory: string, exceptions: string[] = []) {
  const directoryPath = server.getDirectoryPath(directory)

  const directoryExists = await pathExists(directoryPath)
  expect(directoryExists).to.be.true

  const files = await readdir(directoryPath)
  const filtered = files.filter(f => exceptions.includes(f) === false)

  expect(filtered).to.have.lengthOf(0)
}

export async function checkRetro3RunnerCacheIsEmpty (runner: Retro3RunnerProcess) {
  const directoryPath = join(homedir(), '.cache', 'retro3-runner-nodejs', runner.getId(), 'transcoding')

  const directoryExists = await pathExists(directoryPath)
  expect(directoryExists).to.be.true

  const files = await readdir(directoryPath)

  expect(files, 'Directory content: ' + files.join(', ')).to.have.lengthOf(0)
}
