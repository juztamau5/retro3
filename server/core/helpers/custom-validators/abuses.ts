import validator from 'validator'
import { abusePredefinedReasonsMap } from '@retroai/retro3-core-utils'
import { AbuseCreate, AbuseFilter, AbusePredefinedReasonsString, AbuseVideoIs } from '@retroai/retro3-models'
import { ABUSE_STATES, CONSTRAINTS_FIELDS } from '../../initializers/constants.js'
import { exists, isArray } from './misc.js'

const ABUSES_CONSTRAINTS_FIELDS = CONSTRAINTS_FIELDS.ABUSES
const ABUSE_MESSAGES_CONSTRAINTS_FIELDS = CONSTRAINTS_FIELDS.ABUSE_MESSAGES

function isAbuseReasonValid (value: string) {
  return exists(value) && validator.default.isLength(value, ABUSES_CONSTRAINTS_FIELDS.REASON)
}

function isAbusePredefinedReasonValid (value: AbusePredefinedReasonsString) {
  return exists(value) && value in abusePredefinedReasonsMap
}

function isAbuseFilterValid (value: AbuseFilter) {
  return value === 'video' || value === 'comment' || value === 'account'
}

function areAbusePredefinedReasonsValid (value: AbusePredefinedReasonsString[]) {
  return exists(value) && isArray(value) && value.every(v => v in abusePredefinedReasonsMap)
}

function isAbuseTimestampValid (value: number) {
  return value === null || (exists(value) && validator.default.isInt('' + value, { min: 0 }))
}

function isAbuseTimestampCoherent (endAt: number, { req }) {
  const startAt = (req.body as AbuseCreate).video.startAt

  return exists(startAt) && endAt > startAt
}

function isAbuseModerationCommentValid (value: string) {
  return exists(value) && validator.default.isLength(value, ABUSES_CONSTRAINTS_FIELDS.MODERATION_COMMENT)
}

function isAbuseStateValid (value: string) {
  return exists(value) && ABUSE_STATES[value] !== undefined
}

function isAbuseVideoIsValid (value: AbuseVideoIs) {
  return exists(value) && (
    value === 'deleted' ||
    value === 'blacklisted'
  )
}

function isAbuseMessageValid (value: string) {
  return exists(value) && validator.default.isLength(value, ABUSE_MESSAGES_CONSTRAINTS_FIELDS.MESSAGE)
}

// ---------------------------------------------------------------------------

export {
  isAbuseReasonValid,
  isAbuseFilterValid,
  isAbusePredefinedReasonValid,
  isAbuseMessageValid,
  areAbusePredefinedReasonsValid,
  isAbuseTimestampValid,
  isAbuseTimestampCoherent,
  isAbuseModerationCommentValid,
  isAbuseStateValid,
  isAbuseVideoIsValid
}
