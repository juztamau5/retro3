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

import {
  RegisterClientFormFieldOptions,
  RegisterClientHookOptions,
  RegisterClientRouteOptions,
  RegisterClientSettingsScriptOptions,
  RegisterClientVideoFieldOptions,
  ServerConfig, SettingEntries
} from '@retroai/retro3-models'

export type RegisterClientOptions = {
  registerHook: (options: RegisterClientHookOptions) => void

  registerVideoField: (commonOptions: RegisterClientFormFieldOptions, videoFormOptions: RegisterClientVideoFieldOptions) => void

  registerSettingsScript: (options: RegisterClientSettingsScriptOptions) => void

  registerClientRoute: (options: RegisterClientRouteOptions) => void

  Retro3Helpers: RegisterClientHelpers
}

export type RegisterClientHelpers = {
  getBaseStaticRoute: () => string

  getBaseRouterRoute: () => string

  // retro3 >= 5.0
  getBaseWebSocketRoute: () => string

  getBasePluginClientPath: () => string

  isLoggedIn: () => boolean

  getAuthHeader: () => { 'Authorization': string } | undefined

  getSettings: () => Promise<SettingEntries>

  getServerConfig: () => Promise<ServerConfig>

  notifier: {
    info: (text: string, title?: string, timeout?: number) => void
    error: (text: string, title?: string, timeout?: number) => void
    success: (text: string, title?: string, timeout?: number) => void
  }

  showModal: (input: {
    title: string
    content: string
    close?: boolean
    cancel?: { value: string, action?: () => void }
    confirm?: { value: string, action?: () => void }
  }) => void

  markdownRenderer: {
    textMarkdownToHTML: (textMarkdown: string) => Promise<string>
    enhancedMarkdownToHTML: (enhancedMarkdown: string) => Promise<string>
  }

  translate: (toTranslate: string) => Promise<string>
}
