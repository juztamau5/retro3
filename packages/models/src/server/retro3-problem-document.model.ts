import { HttpStatusCodeType } from '../http/http-status-codes.js'
import { OAuth2ErrorCodeType, ServerErrorCodeType } from './server-error-code.enum.js'

export interface Retro3ProblemDocumentData {
  'invalid-params'?: Record<string, object>

  originUrl?: string

  keyId?: string

  targetUrl?: string

  actorUrl?: string

  // Feeds
  format?: string
  url?: string
}

export interface Retro3ProblemDocument extends Retro3ProblemDocumentData {
  type: string
  title: string

  detail: string
  // FIXME: Compat PeerTube <= 3.2
  error: string

  status: HttpStatusCodeType

  docs?: string
  code?: OAuth2ErrorCodeType | ServerErrorCodeType
}
