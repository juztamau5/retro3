/*
 * Copyright (C) 2024 retro.ai
 * This file is part of retro3 - https://github.com/juztamau5/retro3
 *
 * This file is derived from the PeerTube project under the the AGPLv3 license.
 * https://joinpeertube.org
 *
 * SPDX-License-Identifier: AGPL-3.0
 * See the file LICENSE.txt for more information.
 */

import './test-embed.scss'
import { Retro3Resolution, PlayerEventType } from '../embed-player-api/definitions'
import { Retro3Player } from '../embed-player-api/player'
import { logger } from '../../root-helpers'

window.addEventListener('load', async () => {
  const urlParts = window.location.href.split('/')
  const lastPart = urlParts[urlParts.length - 1]

  const isPlaylist = window.location.pathname.startsWith('/video-playlists/')

  const elementId = !lastPart.includes('?') ? lastPart : lastPart.split('?')[0]

  const iframe = document.createElement('iframe')
  iframe.src = isPlaylist
    ? `/video-playlists/embed/${elementId}?api=1`
    : `/videos/embed/${elementId}?api=1&waitPasswordFromEmbedAPI=1`

  iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-popups', 'allow-forms')

  const mainElement = document.querySelector('#host')
  mainElement.appendChild(iframe)

  logger.info('Document finished loading.')
  const player = new Retro3Player(document.querySelector('iframe'));

  (window as any)['player'] = player

  logger.info('Awaiting player ready...')
  await player.setVideoPassword('toto')

  await player.ready
  logger.info('Player is ready.')

  const monitoredEvents = [
    'pause',
    'play',
    'playbackStatusUpdate',
    'playbackStatusChange'
  ]

  monitoredEvents.forEach(e => {
    player.addEventListener(e as PlayerEventType, (param) => logger.info(`PLAYER: event '${e}' received`, { param }))
    logger.info(`PLAYER: now listening for event '${e}'`)

    if (isPlaylist) {
      player.getCurrentPosition()
        .then(position => {
          document.getElementById('playlist-position').innerHTML = position + ''
        })
    }
  })

  let playbackRates: number[] = []
  let currentRate = await player.getPlaybackRate()

  const updateRates = () => {
    const rateListEl = document.querySelector('#rate-list')
    rateListEl.innerHTML = ''

    playbackRates.forEach(rate => {
      if (currentRate === rate) {
        const itemEl = document.createElement('strong')
        itemEl.innerText = `${rate} (active)`
        itemEl.style.display = 'block'
        rateListEl.appendChild(itemEl)
      } else {
        const itemEl = document.createElement('a')
        itemEl.href = 'javascript:;'
        itemEl.innerText = rate.toString()
        itemEl.addEventListener('click', () => {
          player.setPlaybackRate(rate)
          currentRate = rate
          updateRates()
        })
        itemEl.style.display = 'block'
        rateListEl.appendChild(itemEl)
      }
    })
  }

  player.getPlaybackRates().then(rates => {
    playbackRates = rates
    updateRates()
  })

  const updateCaptions = async () => {
    const captions = await player.getCaptions()

    const captionEl = document.querySelector('#caption-list')
    captionEl.innerHTML = ''

    captions.forEach(c => {
      if (c.mode === 'showing') {
        const itemEl = document.createElement('strong')
        itemEl.innerText = `${c.label} (active)`
        itemEl.style.display = 'block'
        captionEl.appendChild(itemEl)
      } else {
        const itemEl = document.createElement('a')
        itemEl.href = 'javascript:;'
        itemEl.innerText = c.label
        itemEl.addEventListener('click', () => {
          player.setCaption(c.id)
          updateCaptions()
        })
        itemEl.style.display = 'block'
        captionEl.appendChild(itemEl)
      }
    })
  }

  updateCaptions()

  const updateResolutions = (resolutions: Retro3Resolution[]) => {
    const resolutionListEl = document.querySelector('#resolution-list')
    resolutionListEl.innerHTML = ''

    resolutions.forEach(resolution => {
      if (resolution.active) {
        const itemEl = document.createElement('strong')
        itemEl.innerText = `${resolution.label} (active)`
        itemEl.style.display = 'block'
        resolutionListEl.appendChild(itemEl)
      } else {
        const itemEl = document.createElement('a')
        itemEl.href = 'javascript:;'
        itemEl.innerText = resolution.label
        itemEl.addEventListener('click', () => {
          player.setResolution(resolution.id)
        })
        itemEl.style.display = 'block'
        resolutionListEl.appendChild(itemEl)
      }
    })
  }

  player.getResolutions().then(
    resolutions => updateResolutions(resolutions))
  player.addEventListener('resolutionUpdate',
    resolutions => updateResolutions(resolutions))

  const updateVolume = (volume: number) => {
    const volumeEl = document.getElementById('volume')
    volumeEl.innerText = (volume * 100) + '%'
  }

  player.getVolume().then(volume => updateVolume(volume))
  player.addEventListener('volumeChange', volume => updateVolume(volume))
})
