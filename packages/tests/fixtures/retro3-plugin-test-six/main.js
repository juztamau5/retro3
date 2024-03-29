const fs = require('fs')
const path = require('path')

async function register ({
  storageManager,
  Retro3Helpers,
  getRouter
}) {
  const { logger } = Retro3Helpers

  {
    await storageManager.storeData('superkey', { value: 'toto' })
    await storageManager.storeData('anotherkey', { value: 'toto2' })
    await storageManager.storeData('storedArrayKey', ['toto', 'toto2'])

    const result = await storageManager.getData('superkey')
    logger.info('superkey stored value is %s', result.value)

    const storedArrayValue = await storageManager.getData('storedArrayKey')
    logger.info('storedArrayKey isArray is %s', Array.isArray(storedArrayValue) ? 'true' : 'false')
    logger.info('storedArrayKey stored value is %s', storedArrayValue.join(', '))
  }

  {
    getRouter().get('/create-file', async (req, res) => {
      const basePath = Retro3Helpers.plugin.getDataDirectoryPath()

      fs.writeFile(path.join(basePath, 'Aladdin.txt'), 'Prince Ali', function (err) {
        if (err) return res.sendStatus(500)

        res.sendStatus(200)
      })
    })
  }
}

async function unregister () {
  return
}

module.exports = {
  register,
  unregister
}

// ###########################################################################
