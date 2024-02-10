import { OAuthTokenModel } from '@server/models/oauth/oauth-token.js'
import { PickWith } from '@retroai/retro3-typescript-utils'
import { MUserAccountUrl } from '../user/user.js'

type Use<K extends keyof OAuthTokenModel, M> = PickWith<OAuthTokenModel, K, M>

// ############################################################################

export type MOAuthToken = Omit<OAuthTokenModel, 'User' | 'OAuthClients'>

export type MOAuthTokenUser =
  MOAuthToken &
  Use<'User', MUserAccountUrl> &
  { user?: MUserAccountUrl }
