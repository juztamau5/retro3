import { doRequest, Retro3RequestOptions } from '@server/helpers/requests.js'

async function httpUnicast (payload: {
  uri: string
  requestOptions: Retro3RequestOptions
}) {
  await doRequest(payload.uri, payload.requestOptions)
}

export default httpUnicast
