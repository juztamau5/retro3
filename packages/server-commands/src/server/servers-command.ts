import { exec } from 'child_process'
import { copy, ensureDir, remove } from 'fs-extra/esm'
import { readdir, readFile } from 'fs/promises'
import { basename, join } from 'path'
import { wait } from '@retroai/retro3-core-utils'
import { HttpStatusCode } from '@retroai/retro3-models'
import { getFileSize, isGithubCI, root } from '@retroai/retro3-node-utils'
import { AbstractCommand, OverrideCommandOptions } from '../shared/index.js'

export class ServersCommand extends AbstractCommand {

  static flushTests (internalServerNumber: number) {
    return new Promise<void>((res, rej) => {
      const suffix = ` -- ${internalServerNumber}`

      return exec('npm run clean:server:test' + suffix, (err, _stdout, stderr) => {
        if (err || stderr) return rej(err || new Error(stderr))

        return res()
      })
    })
  }

  ping (options: OverrideCommandOptions = {}) {
    return this.getRequestBody({
      ...options,

      path: '/api/v1/ping',
      implicitToken: false,
      defaultExpectedStatus: HttpStatusCode.OK_200
    })
  }

  cleanupTests () {
    const promises: Promise<any>[] = []

    const saveGithubLogsIfNeeded = async () => {
      if (!isGithubCI()) return

      await ensureDir('artifacts')

      const origin = this.buildDirectory('logs/retro3.log')
      const destname = `retro3-${this.server.internalServerNumber}.log`
      console.log('Saving logs %s.', destname)

      await copy(origin, join('artifacts', destname))
    }

    if (this.server.parallel) {
      const promise = saveGithubLogsIfNeeded()
                        .then(() => ServersCommand.flushTests(this.server.internalServerNumber))

      promises.push(promise)
    }

    if (this.server.customConfigFile) {
      promises.push(remove(this.server.customConfigFile))
    }

    return promises
  }

  async waitUntilLog (str: string, count = 1, strictCount = true) {
    const logfile = this.buildDirectory('logs/retro3.log')

    while (true) {
      const buf = await readFile(logfile)

      const matches = buf.toString().match(new RegExp(str, 'g'))
      if (matches && matches.length === count) return
      if (matches && strictCount === false && matches.length >= count) return

      await wait(1000)
    }
  }

  buildDirectory (directory: string) {
    return join(root(), 'test' + this.server.internalServerNumber, directory)
  }

  async countFiles (directory: string) {
    const files = await readdir(this.buildDirectory(directory))

    return files.length
  }

  buildWebVideoFilePath (fileUrl: string) {
    return this.buildDirectory(join('web-videos', basename(fileUrl)))
  }

  buildFragmentedFilePath (videoUUID: string, fileUrl: string) {
    return this.buildDirectory(join('streaming-playlists', 'hls', videoUUID, basename(fileUrl)))
  }

  getLogContent () {
    return readFile(this.buildDirectory('logs/retro3.log'))
  }

  async getServerFileSize (subPath: string) {
    const path = this.server.servers.buildDirectory(subPath)

    return getFileSize(path)
  }
}
