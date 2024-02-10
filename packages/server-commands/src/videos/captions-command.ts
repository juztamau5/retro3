import { HttpStatusCode, ResultList, VideoCaption } from '@retroai/retro3-models'
import { buildAbsoluteFixturePath } from '@retroai/retro3-node-utils'
import { AbstractCommand, OverrideCommandOptions } from '../shared/index.js'

export class CaptionsCommand extends AbstractCommand {

  add (options: OverrideCommandOptions & {
    videoId: string | number
    language: string
    fixture: string
    mimeType?: string
  }) {
    const { videoId, language, fixture, mimeType } = options

    const path = '/api/v1/videos/' + videoId + '/captions/' + language

    const captionfile = buildAbsoluteFixturePath(fixture)
    const captionfileAttach = mimeType
      ? [ captionfile, { contentType: mimeType } ]
      : captionfile

    return this.putUploadRequest({
      ...options,

      path,
      fields: {},
      attaches: {
        captionfile: captionfileAttach
      },
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }

  list (options: OverrideCommandOptions & {
    videoId: string | number
    videoPassword?: string
  }) {
    const { videoId, videoPassword } = options
    const path = '/api/v1/videos/' + videoId + '/captions'

    return this.getRequestBody<ResultList<VideoCaption>>({
      ...options,

      path,
      headers: this.buildVideoPasswordHeader(videoPassword),
      implicitToken: false,
      defaultExpectedStatus: HttpStatusCode.OK_200
    })
  }

  delete (options: OverrideCommandOptions & {
    videoId: string | number
    language: string
  }) {
    const { videoId, language } = options
    const path = '/api/v1/videos/' + videoId + '/captions/' + language

    return this.deleteRequest({
      ...options,

      path,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }
}
