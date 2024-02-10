import { RegisterServerOptions, Video } from '../dist/index.js'
import { RegisterClientOptions } from '../dist/client/index.js'

function register1 ({ registerHook }: RegisterServerOptions) {
  registerHook({
    target: 'action:application.listening',
    handler: () => console.log('hello')
  })
}

function register2 ({ registerHook, Retro3Helpers }: RegisterClientOptions) {
  registerHook({
    target: 'action:admin-plugin-settings.init',
    handler: ({ npmName }: { npmName: string }) => {
      if ('retro3-plugin-transcription' !== npmName) {
        return
      }
    },
  })

  registerHook({
    target: 'action:video-watch.video.loaded',
    handler: ({ video }: { video: Video }) => {
      fetch(`${Retro3Helpers.getBaseRouterRoute()}/videos/${video.uuid}/captions`, {
        method: 'PUT',
        headers: Retro3Helpers.getAuthHeader(),
      })
        .then((res) => res.json())
        .then((data) => console.log('Hi %s.', data))
    },
  })
}
