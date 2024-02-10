import { sanitizeUrl } from '@server/helpers/core-utils.js'
import { logger } from '@server/helpers/logger.js'
import { doJSONRequest } from '@server/helpers/requests.js'
import { CONFIG } from '@server/initializers/config.js'
import { RETRO3_VERSION } from '@server/initializers/constants.js'
import { PluginModel } from '@server/models/server/plugin.js'
import {
  Retro3PluginIndex,
  Retro3PluginIndexList,
  Retro3PluginLatestVersionRequest,
  Retro3PluginLatestVersionResponse,
  ResultList
} from '@retroai/retro3-models'
import { PluginManager } from './plugin-manager.js'

async function listAvailablePluginsFromIndex (options: Retro3PluginIndexList) {
  const { start = 0, count = 20, search, sort = 'npmName', pluginType } = options

  const searchParams: Retro3PluginIndexList & Record<string, string | number> = {
    start,
    count,
    sort,
    pluginType,
    search,
    currentRetro3Engine: options.currentRetro3Engine || RETRO3_VERSION
  }

  const uri = CONFIG.PLUGINS.INDEX.URL + '/api/v1/plugins'

  try {
    const { body } = await doJSONRequest<any>(uri, { searchParams })

    logger.debug('Got result from retro3 index.', { body })

    addInstanceInformation(body)

    return body as ResultList<Retro3PluginIndex>
  } catch (err) {
    logger.error('Cannot list available plugins from index %s.', uri, { err })
    return undefined
  }
}

function addInstanceInformation (result: ResultList<Retro3PluginIndex>) {
  for (const d of result.data) {
    d.installed = PluginManager.Instance.isRegistered(d.npmName)
    d.name = PluginModel.normalizePluginName(d.npmName)
  }

  return result
}

async function getLatestPluginsVersion (npmNames: string[]): Promise<Retro3PluginLatestVersionResponse> {
  const bodyRequest: Retro3PluginLatestVersionRequest = {
    npmNames,
    currentRetro3Engine: RETRO3_VERSION
  }

  const uri = sanitizeUrl(CONFIG.PLUGINS.INDEX.URL) + '/api/v1/plugins/latest-version'

  const options = {
    json: bodyRequest,
    method: 'POST' as 'POST'
  }
  const { body } = await doJSONRequest<Retro3PluginLatestVersionResponse>(uri, options)

  return body
}

async function getLatestPluginVersion (npmName: string) {
  const results = await getLatestPluginsVersion([ npmName ])

  if (Array.isArray(results) === false || results.length !== 1) {
    logger.warn('Cannot get latest supported plugin version of %s.', npmName)
    return undefined
  }

  return results[0].latestVersion
}

export {
  listAvailablePluginsFromIndex,
  getLatestPluginVersion,
  getLatestPluginsVersion
}
