import { Job } from 'bullmq'
import { EmailPayload } from '@retroai/retro3-models'
import { logger } from '../../../helpers/logger.js'
import { Emailer } from '../../emailer.js'

async function processEmail (job: Job) {
  const payload = job.data as EmailPayload
  logger.info('Processing email in job %s.', job.id)

  return Emailer.Instance.sendMail(payload)
}

// ---------------------------------------------------------------------------

export {
  processEmail
}
