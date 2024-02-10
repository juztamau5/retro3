import { compareSemVer } from '@retroai/retro3-core-utils'
import chunk from 'lodash-es/chunk.js'
import { logger } from '../../helpers/logger.js'
import { CONFIG } from '../../initializers/config.js'
import { SCHEDULER_INTERVALS_MS } from '../../initializers/constants.js'
import { PluginModel } from '../../models/server/plugin.js'
import { Notifier } from '../notifier/index.js'
import { getLatestPluginsVersion } from '../plugins/plugin-index.js'
import { AbstractScheduler } from './abstract-scheduler.js'

export class PluginsCheckScheduler extends AbstractScheduler {

  private static instance: AbstractScheduler

  protected schedulerIntervalMs = SCHEDULER_INTERVALS_MS.CHECK_PLUGINS

  private constructor () {
    super()
  }

  protected async internalExecute () {
    return this.checkLatestPluginsVersion()
  }

  private async checkLatestPluginsVersion () {
    if (CONFIG.PLUGINS.INDEX.ENABLED === false) return

    logger.info('Checking latest plugins version.')

    const plugins = await PluginModel.listInstalled()

    // Process 10 plugins in 1 HTTP request
    const chunks = chunk(plugins, 10)
    for (const chunk of chunks) {
      // Find plugins according to their npm name
      const pluginIndex: { [npmName: string]: PluginModel } = {}
      for (const plugin of chunk) {
        pluginIndex[PluginModel.buildNpmName(plugin.name, plugin.type)] = plugin
      }

      const npmNames = Object.keys(pluginIndex)

      try {
        const results = await getLatestPluginsVersion(npmNames)

        for (const result of results) {
          const plugin = pluginIndex[result.npmName]
          if (!result.latestVersion) continue

          if (
            !plugin.latestVersion ||
            (plugin.latestVersion !== result.latestVersion && compareSemVer(plugin.latestVersion, result.latestVersion) < 0)
          ) {
            plugin.latestVersion = result.latestVersion
            await plugin.save()

            // Notify if there is an higher plugin version available
            if (compareSemVer(plugin.version, result.latestVersion) < 0) {
              Notifier.Instance.notifyOfNewPluginVersion(plugin)
            }

            logger.info('Plugin %s has a new latest version %s.', result.npmName, plugin.latestVersion)
          }
        }
      } catch (err) {
        logger.error('Cannot get latest plugins version.', { npmNames, err })
      }
    }
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }
}
