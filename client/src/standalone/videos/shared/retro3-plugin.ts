/*
 * Copyright (C) 2024 retro.ai
 * This file is part of retro3 - https://github.com/juztamau5/retro3
 *
 * This file is derived from the PeerTube project under the the AGPLv3 license.
 * https://joinpeertube.org
 *
 * SPDX-License-Identifier: AGPL-3.0
 * See the file LICENSE.txt for more information.
 */

import { retro3Translate } from '@retroai/retro3-core-utils'
import { HTMLServerConfig, PublicServerSetting } from '@retroai/retro3-models'
import { PluginInfo, PluginsManager } from '../../../root-helpers'
import { RegisterClientHelpers } from '../../../types'
import { AuthHTTP } from './auth-http'
import { Translations } from './translations'

export class Retro3Plugin {

  private pluginsManager: PluginsManager

  constructor (private readonly http: AuthHTTP) {

  }

  loadPlugins (config: HTMLServerConfig, translations?: Translations) {
    this.pluginsManager = new PluginsManager({
      Retro3HelpersFactory: pluginInfo => this.buildRetro3Helpers({
        pluginInfo,
        translations
      })
    })

    this.pluginsManager.loadPluginsList(config)

    return this.pluginsManager.ensurePluginsAreLoaded('embed')
  }

  getPluginsManager () {
    return this.pluginsManager
  }

  private buildRetro3Helpers (options: {
    pluginInfo: PluginInfo
    translations?: Translations
  }): RegisterClientHelpers {
    const { pluginInfo, translations } = options

    const unimplemented = () => {
      throw new Error('This helper is not implemented in embed.')
    }

    return {
      getBaseStaticRoute: unimplemented,
      getBaseRouterRoute: unimplemented,
      getBaseWebSocketRoute: unimplemented,
      getBasePluginClientPath: unimplemented,

      getSettings: () => {
        const url = this.getPluginUrl() + '/' + pluginInfo.plugin.npmName + '/public-settings'

        return this.http.fetch(url, { optionalAuth: true })
          .then(res => res.json())
          .then((obj: PublicServerSetting) => obj.publicSettings)
      },

      isLoggedIn: () => this.http.isLoggedIn(),
      getAuthHeader: () => {
        if (!this.http.isLoggedIn()) return undefined

        return { Authorization: this.http.getHeaderTokenValue() }
      },

      notifier: {
        info: unimplemented,
        error: unimplemented,
        success: unimplemented
      },

      showModal: unimplemented,

      getServerConfig: unimplemented,

      markdownRenderer: {
        textMarkdownToHTML: unimplemented,
        enhancedMarkdownToHTML: unimplemented
      },

      translate: (value: string) => Promise.resolve(retro3Translate(value, translations))
    }
  }

  private getPluginUrl () {
    return window.location.origin + '/api/v1/plugins'
  }
}
