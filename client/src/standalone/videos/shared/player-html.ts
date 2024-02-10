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

import { retro3Translate } from '@retroai/retro3-core-utils'
import { logger } from '../../../root-helpers'
import { Translations } from './translations'

export class PlayerHTML {
  private readonly wrapperElement: HTMLElement | null

  private playerElement: HTMLVideoElement | null
  private informationElement: HTMLDivElement | null

  constructor (private readonly videoWrapperId: string) {
    this.wrapperElement = document.getElementById(this.videoWrapperId)
  }

  getPlayerElement () {
    return this.playerElement
  }

  setPlayerElement (playerElement: HTMLVideoElement) {
    this.playerElement = playerElement
  }

  removePlayerElement () {
    this.playerElement = null
  }

  addPlayerElementToDOM () {
    if (this.wrapperElement && this.playerElement)
      this.wrapperElement.appendChild(this.playerElement)
  }

  displayError (text: string, translations: Translations) {
    logger.error(text)

    // Remove video element
    if (this.playerElement) {
      this.removeElement(this.playerElement)
      this.playerElement = null
    }

    const translatedText = retro3Translate(text, translations)
    const translatedSorry = retro3Translate('Sorry', translations)

    document.title = translatedSorry + ' - ' + translatedText

    const errorBlock = document.getElementById('error-block')
    if (errorBlock)
      errorBlock.style.display = 'flex'

    const errorTitle = document.getElementById('error-title')
    if (errorTitle)
      errorTitle.innerHTML = retro3Translate('Sorry', translations)

    const errorText = document.getElementById('error-content')
    if (errorText)
      errorText.innerHTML = translatedText;

    if (this.wrapperElement)
      this.wrapperElement.style.display = 'none'
  }

  async askVideoPassword (options: { incorrectPassword: boolean, translations: Translations }): Promise<string> {
    const { incorrectPassword, translations } = options
    return new Promise((resolve) => {

      if (this.wrapperElement)
        this.wrapperElement.style.display = 'none'

      const translatedTitle = retro3Translate('This video is password protected', translations)
      const translatedMessage = retro3Translate('You need a password to watch this video.', translations)

      document.title = translatedTitle

      const videoPasswordBlock = document.getElementById('video-password-block')
      videoPasswordBlock.style.display = 'flex'

      const videoPasswordTitle = document.getElementById('video-password-title')
      videoPasswordTitle.innerHTML = translatedTitle

      const videoPasswordMessage = document.getElementById('video-password-content')
      videoPasswordMessage.innerHTML = translatedMessage

      if (incorrectPassword) {
        const videoPasswordError = document.getElementById('video-password-error')
        videoPasswordError.innerHTML = retro3Translate('Incorrect password, please enter a correct password', translations)
        videoPasswordError.style.transform = 'scale(1.2)'

        setTimeout(() => {
          videoPasswordError.style.transform = 'scale(1)'
        }, 500)
      }

      const videoPasswordSubmitButton = document.getElementById('video-password-submit')
      videoPasswordSubmitButton.innerHTML = retro3Translate('Watch Video', translations)

      const videoPasswordInput = document.getElementById('video-password-input') as HTMLInputElement
      videoPasswordInput.placeholder = retro3Translate('Password', translations)

      const videoPasswordForm = document.getElementById('video-password-form')
      videoPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const videoPassword = videoPasswordInput.value
        resolve(videoPassword)
      })
    })
  }

  removeVideoPasswordBlock () {
    const videoPasswordBlock = document.getElementById('video-password-block')
    videoPasswordBlock.style.display = 'none'
    this.wrapperElement.style.display = 'block'
  }

  displayInformation (text: string, translations: Translations) {
    if (this.informationElement) this.removeInformation()

    this.informationElement = document.createElement('div')
    this.informationElement.className = 'player-information'
    this.informationElement.innerText = retro3Translate(text, translations)

    document.body.appendChild(this.informationElement)
  }

  removeInformation () {
    if (!this.informationElement) return

    this.removeElement(this.informationElement)
    this.informationElement = undefined
  }

  private removeElement (element: HTMLElement) {
    element.parentElement.removeChild(element)
  }
}
