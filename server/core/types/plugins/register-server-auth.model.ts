import express from 'express'
import { UserAdminFlagType, UserRoleType } from '@retroai/retro3-models'
import { MOAuthToken, MUser } from '../models/index.js'

export type RegisterServerAuthOptions = RegisterServerAuthPassOptions | RegisterServerAuthExternalOptions

export type AuthenticatedResultUpdaterFieldName = 'displayName' | 'role' | 'adminFlags' | 'videoQuota' | 'videoQuotaDaily'

export interface RegisterServerAuthenticatedResult {
  // Update the user profile if it already exists
  // Default behaviour is no update
  // Introduced in retro3 >= 5.1
  userUpdater?: <T> (options: {
    fieldName: AuthenticatedResultUpdaterFieldName
    currentValue: T
    newValue: T
  }) => T

  username: string
  email: string
  role?: UserRoleType
  displayName?: string

  // retro3 >= 5.1
  adminFlags?: UserAdminFlagType

  // retro3 >= 5.1
  videoQuota?: number
  // retro3 >= 5.1
  videoQuotaDaily?: number
}

export interface RegisterServerExternalAuthenticatedResult extends RegisterServerAuthenticatedResult {
  req: express.Request
  res: express.Response
}

interface RegisterServerAuthBase {
  // Authentication name (a plugin can register multiple auth strategies)
  authName: string

  // Called by retro3 when a user from your plugin logged out
  // Returns a redirectUrl sent to the client or nothing
  onLogout?(user: MUser, req: express.Request): Promise<string>

  // Your plugin can hook retro3 access/refresh token validity
  // So you can control for your plugin the user session lifetime
  hookTokenValidity?(options: { token: MOAuthToken, type: 'access' | 'refresh' }): Promise<{ valid: boolean }>
}

export interface RegisterServerAuthPassOptions extends RegisterServerAuthBase {
  // Weight of this authentication so retro3 tries the auth methods in DESC weight order
  getWeight(): number

  // Used by retro3 to login a user
  // Returns null if the login failed, or { username, email } on success
  login(body: {
    id: string
    password: string
  }): Promise<RegisterServerAuthenticatedResult | null>
}

export interface RegisterServerAuthExternalOptions extends RegisterServerAuthBase {
  // Will be displayed in a block next to the login form
  authDisplayName: () => string

  onAuthRequest: (req: express.Request, res: express.Response) => void
}

export interface RegisterServerAuthExternalResult {
  userAuthenticated (options: RegisterServerExternalAuthenticatedResult): void
}
