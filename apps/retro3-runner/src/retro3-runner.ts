#!/usr/bin/env node

import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import { listRegistered, registerRunner, unregisterRunner } from './register/index.js'
import { RunnerServer } from './server/index.js'
import { ConfigManager, logger } from './shared/index.js'

const program = new Command()
  .version(process.env.PACKAGE_VERSION)
  .option(
    '--id <id>',
    'Runner server id, so you can run multiple retro3 server runners with different configurations on the same machine',
    'default'
  )
  .option('--verbose', 'Run in verbose mode')
  .hook('preAction', thisCommand => {
    const options = thisCommand.opts()

    ConfigManager.Instance.init(options.id)

    if (options.verbose === true) {
      logger.level = 'debug'
    }
  })

program.command('server')
  .description('Run in server mode, to execute remote jobs of registered retro3 instances')
  .action(async () => {
    try {
      await RunnerServer.Instance.run()
    } catch (err) {
      logger.error(err, 'Cannot run retro3 runner as server mode')
      process.exit(-1)
    }
  })

program.command('register')
  .description('Register a new retro3 instance to process runner jobs')
  .requiredOption('--url <url>', 'retro3 instance URL', parseUrl)
  .requiredOption('--registration-token <token>', 'Runner registration token (can be found in retro3 instance administration')
  .requiredOption('--runner-name <name>', 'Runner name')
  .option('--runner-description <description>', 'Runner description')
  .action(async options => {
    try {
      await registerRunner(options)
    } catch (err) {
      console.error('Cannot register this retro3 runner.')
      console.error(err)
      process.exit(-1)
    }
  })

program.command('unregister')
  .description('Unregister the runner from retro3 instance')
  .requiredOption('--url <url>', 'retro3 instance URL', parseUrl)
  .requiredOption('--runner-name <name>', 'Runner name')
  .action(async options => {
    try {
      await unregisterRunner(options)
    } catch (err) {
      console.error('Cannot unregister this retro3 runner.')
      console.error(err)
      process.exit(-1)
    }
  })

program.command('list-registered')
  .description('List registered retro3 instances')
  .action(async () => {
    try {
      await listRegistered()
    } catch (err) {
      console.error('Cannot list registered retro3 instances.')
      console.error(err)
      process.exit(-1)
    }
  })

program.parse()

// ---------------------------------------------------------------------------
// Private
// ---------------------------------------------------------------------------

function parseUrl (url: string) {
  if (url.startsWith('http://') !== true && url.startsWith('https://') !== true) {
    throw new InvalidArgumentError('URL should start with a http:// or https://')
  }

  return url
}
