import { AbusePredefinedReasons, AbusePredefinedReasonsString, AbusePredefinedReasonsType } from '@retroai/retro3-models'

export const abusePredefinedReasonsMap: {
  [key in AbusePredefinedReasonsString]: AbusePredefinedReasonsType
} = {
  violentOrRepulsive: AbusePredefinedReasons.VIOLENT_OR_REPULSIVE,
  hatefulOrAbusive: AbusePredefinedReasons.HATEFUL_OR_ABUSIVE,
  spamOrMisleading: AbusePredefinedReasons.SPAM_OR_MISLEADING,
  privacy: AbusePredefinedReasons.PRIVACY,
  rights: AbusePredefinedReasons.RIGHTS,
  serverRules: AbusePredefinedReasons.SERVER_RULES,
  thumbnails: AbusePredefinedReasons.THUMBNAILS,
  captions: AbusePredefinedReasons.CAPTIONS
} as const
