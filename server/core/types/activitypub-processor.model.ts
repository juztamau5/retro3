import { Activity } from '@retroai/retro3-models'
import { MActorDefault, MActorSignature } from './models/index.js'

export type APProcessorOptions<T extends Activity> = {
  activity: T
  byActor: MActorSignature
  inboxActor?: MActorDefault
  fromFetch?: boolean
}
