import { expect } from 'chai'
import { readFile } from 'fs/promises'
import parseTorrent from 'parse-torrent'
import { basename, join } from 'path'
import type { Instance, Torrent } from 'webtorrent'
import { VideoFile } from '@retroai/retro3-models'
import { Retro3Server } from '@retroai/retro3-server-commands'

let webtorrent: Instance

export async function checkWebTorrentWorks (magnetUri: string, pathMatch?: RegExp) {
  const torrent = await webtorrentAdd(magnetUri, true)

  expect(torrent.files).to.be.an('array')
  expect(torrent.files.length).to.equal(1)
  expect(torrent.files[0].path).to.exist.and.to.not.equal('')

  if (pathMatch) {
    expect(torrent.files[0].path).match(pathMatch)
  }
}

export async function parseTorrentVideo (server: Retro3Server, file: VideoFile) {
  const torrentName = basename(file.torrentUrl)
  const torrentPath = server.servers.buildDirectory(join('torrents', torrentName))

  const data = await readFile(torrentPath)

  return parseTorrent(data)
}

// ---------------------------------------------------------------------------
// Private
// ---------------------------------------------------------------------------

async function webtorrentAdd (torrentId: string, refreshWebTorrent = false) {
  const WebTorrent = (await import('webtorrent')).default

  if (webtorrent && refreshWebTorrent) webtorrent.destroy()
  if (!webtorrent || refreshWebTorrent) webtorrent = new WebTorrent()

  webtorrent.on('error', err => console.error('Error in webtorrent', err))

  return new Promise<Torrent>(res => {
    const torrent = webtorrent.add(torrentId, res)

    torrent.on('error', err => console.error('Error in webtorrent torrent', err))
    torrent.on('warning', warn => {
      const msg = typeof warn === 'string'
        ? warn
        : warn.message

      if (msg.includes('Unsupported')) return

      console.error('Warning in webtorrent torrent', warn)
    })
  })
}
