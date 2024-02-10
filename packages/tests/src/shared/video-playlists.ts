import { expect } from 'chai'
import { readdir } from 'fs/promises'
import { Retro3Server } from '@retroai/retro3-server-commands'

async function checkPlaylistFilesWereRemoved (
  playlistUUID: string,
  server: Retro3Server,
  directories = [ 'thumbnails' ]
) {
  for (const directory of directories) {
    const directoryPath = server.getDirectoryPath(directory)

    const files = await readdir(directoryPath)
    for (const file of files) {
      expect(file).to.not.contain(playlistUUID)
    }
  }
}

export {
  checkPlaylistFilesWereRemoved
}
