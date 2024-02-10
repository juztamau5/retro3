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

import { HttpStatusCode, OAuth2ErrorCode, OAuth2ErrorCodeType, UserRefreshToken } from '@retroai/retro3-models'
import { OAuthUserTokens, objectToUrlEncoded } from '../../../root-helpers'
import { retro3LocalStorage } from '../../../root-helpers/retro3-web-storage'

export class AuthHTTP {
  private readonly LOCAL_STORAGE_OAUTH_CLIENT_KEYS = {
    CLIENT_ID: 'client_id',
    CLIENT_SECRET: 'client_secret'
  }

  private userOAuthTokens: OAuthUserTokens

  private headers = new Headers()

  constructor () {
    this.userOAuthTokens = OAuthUserTokens.getUserTokens(retro3LocalStorage)

    if (this.userOAuthTokens) this.setHeadersFromTokens()
  }

  fetch (url: string, { optionalAuth, method }: { optionalAuth: boolean, method?: string }, videoPassword?: string) {
    let refreshFetchOptions: { headers?: Headers } = {}

    if (videoPassword) this.headers.set('x-retro3-video-password', videoPassword)

    if (videoPassword || optionalAuth) refreshFetchOptions = { headers: this.headers }

    return this.refreshFetch(url.toString(), { ...refreshFetchOptions, method })
  }

  getHeaderTokenValue () {
    if (!this.userOAuthTokens) return null

    return `${this.userOAuthTokens.tokenType} ${this.userOAuthTokens.accessToken}`
  }

  isLoggedIn () {
    return !!this.userOAuthTokens
  }

  private refreshFetch (url: string, options?: RequestInit) {
    return fetch(url, options)
      .then((res: Response) => {
        if (res.status !== HttpStatusCode.UNAUTHORIZED_401) return res

        const refreshingTokenPromise = new Promise<void>((resolve, reject) => {
          const clientId: string = retro3LocalStorage.getItem(this.LOCAL_STORAGE_OAUTH_CLIENT_KEYS.CLIENT_ID)
          const clientSecret: string = retro3LocalStorage.getItem(this.LOCAL_STORAGE_OAUTH_CLIENT_KEYS.CLIENT_SECRET)

          const headers = new Headers()
          headers.set('Content-Type', 'application/x-www-form-urlencoded')

          const data = {
            refresh_token: this.userOAuthTokens.refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            response_type: 'code',
            grant_type: 'refresh_token'
          }

          fetch('/api/v1/users/token', {
            headers,
            method: 'POST',
            body: objectToUrlEncoded(data)
          }).then(res => {
            if (res.status === HttpStatusCode.UNAUTHORIZED_401) return undefined

            return res.json()
          }).then((obj: UserRefreshToken & { code?: OAuth2ErrorCodeType }) => {
            if (!obj || obj.code === OAuth2ErrorCode.INVALID_GRANT) {
              OAuthUserTokens.flushLocalStorage(retro3LocalStorage)
              this.removeTokensFromHeaders()

              return resolve()
            }

            this.userOAuthTokens.accessToken = obj.access_token
            this.userOAuthTokens.refreshToken = obj.refresh_token
            OAuthUserTokens.saveToLocalStorage(retro3LocalStorage, this.userOAuthTokens)

            this.setHeadersFromTokens()

            resolve()
          }).catch((refreshTokenError: any) => {
            reject(refreshTokenError)
          })
        })

        return refreshingTokenPromise
          .catch(() => {
            OAuthUserTokens.flushLocalStorage(retro3LocalStorage)

            this.removeTokensFromHeaders()
          }).then(() => fetch(url, {
            ...options,

            headers: this.headers
          }))
      })
  }

  private setHeadersFromTokens () {
    this.headers.set('Authorization', this.getHeaderTokenValue())
  }

  private removeTokensFromHeaders () {
    this.headers.delete('Authorization')
  }
}
