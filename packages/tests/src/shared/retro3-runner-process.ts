import { ChildProcess, fork, ForkOptions } from 'child_process'
import { execaNode } from 'execa'
import { join } from 'path'
import { root } from '@retroai/retro3-node-utils'
import { Retro3Server } from '@retroai/retro3-server-commands'

export class Retro3RunnerProcess {
  private app?: ChildProcess

  constructor (private readonly server: Retro3Server) {

  }

  runServer (options: {
    hideLogs?: boolean // default true
  } = {}) {
    const { hideLogs = true } = options

    return new Promise<void>((res, rej) => {
      const args = [ 'server', '--verbose', ...this.buildIdArg() ]

      const forkOptions: ForkOptions = {
        detached: false,
        silent: true,
        execArgv: [] // Don't inject parent node options
      }

      this.app = fork(this.getRunnerPath(), args, forkOptions)

      this.app.stdout.on('data', data => {
        const str = data.toString() as string

        if (!hideLogs) {
          console.log(str)
        }
      })

      res()
    })
  }

  registerRetro3Instance (options: {
    registrationToken: string
    runnerName: string
    runnerDescription?: string
  }) {
    const { registrationToken, runnerName, runnerDescription } = options

    const args = [
      'register',
      '--url', this.server.url,
      '--registration-token', registrationToken,
      '--runner-name', runnerName,
      ...this.buildIdArg()
    ]

    if (runnerDescription) {
      args.push('--runner-description')
      args.push(runnerDescription)
    }

    return this.runCommand(this.getRunnerPath(), args)
  }

  unregisterRetro3Instance (options: {
    runnerName: string
  }) {
    const { runnerName } = options

    const args = [ 'unregister', '--url', this.server.url, '--runner-name', runnerName, ...this.buildIdArg() ]
    return this.runCommand(this.getRunnerPath(), args)
  }

  async listRegisteredRetro3Instances () {
    const args = [ 'list-registered', ...this.buildIdArg() ]
    const { stdout } = await this.runCommand(this.getRunnerPath(), args)

    return stdout
  }

  kill () {
    if (!this.app) return

    process.kill(this.app.pid)

    this.app = null
  }

  getId () {
    return 'test-' + this.server.internalServerNumber
  }

  private getRunnerPath () {
    return join(root(), 'apps', 'retro3-runner', 'dist', 'retro3-runner.js')
  }

  private buildIdArg () {
    return [ '--id', this.getId() ]
  }

  private runCommand (path: string, args: string[]) {
    return execaNode(path, args, { env: { ...process.env, NODE_OPTIONS: '' } })
  }
}
