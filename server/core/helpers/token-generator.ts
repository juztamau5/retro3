import { buildUUID } from '@retroai/retro3-node-utils'

function generateRunnerRegistrationToken () {
  return 'ptrrt-' + buildUUID()
}

function generateRunnerToken () {
  return 'ptrt-' + buildUUID()
}

function generateRunnerJobToken () {
  return 'ptrjt-' + buildUUID()
}

export {
  generateRunnerRegistrationToken,
  generateRunnerToken,
  generateRunnerJobToken
}
