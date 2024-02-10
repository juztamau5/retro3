import { FunctionProperties } from '@retroai/retro3-typescript-utils'
import { ActorImageModel } from '../../../models/actor/actor-image.js'

export type MActorImage = ActorImageModel

// ############################################################################

// Format for API or AP object

export type MActorImageFormattable =
  FunctionProperties<MActorImage> &
  Pick<MActorImage, 'width' | 'filename' | 'createdAt' | 'updatedAt'>
