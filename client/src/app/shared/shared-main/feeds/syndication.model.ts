import { FeedFormatType } from '@retroai/retro3-models'

export interface Syndication {
  format: FeedFormatType
  label: string
  url: string
}
