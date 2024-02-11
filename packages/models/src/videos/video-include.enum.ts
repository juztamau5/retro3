export const VideoInclude = {
  NONE: 0,
  NOT_PUBLISHED_STATE: 1 << 0,
  BLACKLISTED: 1 << 1,
  BLOCKED_OWNER: 1 << 2,
  FILES: 1 << 3,
  CAPTIONS: 1 << 4
} as const

export type VideoIncludeType = typeof VideoInclude[keyof typeof VideoInclude]
