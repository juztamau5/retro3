import {
  NextPreviousVideoButtonOptions,
  Retro3LinkButtonOptions,
  Retro3PlayerContructorOptions,
  Retro3PlayerLoadOptions,
  TheaterButtonOptions
} from '../../types'

type ControlBarOptionsBuilderConstructorOptions =
  Pick<Retro3PlayerContructorOptions, 'retro3Link' | 'instanceName' | 'theaterButton'> &
  {
    videoShortUUID: () => string
    p2pEnabled: () => boolean

    previousVideo: () => Retro3PlayerLoadOptions['previousVideo']
    nextVideo: () => Retro3PlayerLoadOptions['nextVideo']
  }

export class ControlBarOptionsBuilder {

  constructor (private options: ControlBarOptionsBuilderConstructorOptions) {
  }

  getChildrenOptions () {
    const children = {
      ...this.getPreviousVideo(),

      playToggle: {},

      ...this.getNextVideo(),

      ...this.getTimeControls(),

      ...this.getProgressControl(),

      p2PInfoButton: {},
      muteToggle: {},
      volumeControl: {},

      ...this.getSettingsButton(),

      ...this.getRetro3LinkButton(),

      ...this.getTheaterButton(),

      fullscreenToggle: {}
    }

    return children
  }

  private getSettingsButton () {
    const settingEntries: string[] = []

    settingEntries.push('playbackRateMenuButton')
    settingEntries.push('captionsButton')
    settingEntries.push('resolutionMenuButton')

    return {
      settingsButton: {
        setup: {
          maxHeightOffset: 60
        },
        entries: settingEntries
      }
    }
  }

  private getTimeControls () {
    return {
      retro3LiveDisplay: {},

      currentTimeDisplay: {},
      timeDivider: {},
      durationDisplay: {}
    }
  }

  private getProgressControl () {
    return {
      progressControl: {
        children: {
          seekBar: {
            children: {
              loadProgressBar: {},
              mouseTimeDisplay: {},
              playProgressBar: {}
            }
          }
        }
      }
    }
  }

  private getPreviousVideo () {
    const buttonOptions: NextPreviousVideoButtonOptions = {
      type: 'previous',
      handler: () => this.options.previousVideo().handler(),
      isDisabled: () => !this.options.previousVideo().enabled,
      isDisplayed: () => this.options.previousVideo().displayControlBarButton
    }

    return { previousVideoButton: buttonOptions }
  }

  private getNextVideo () {
    const buttonOptions: NextPreviousVideoButtonOptions = {
      type: 'next',
      handler: () => this.options.nextVideo().handler(),
      isDisabled: () => !this.options.nextVideo().enabled,
      isDisplayed: () => this.options.nextVideo().displayControlBarButton
    }

    return { nextVideoButton: buttonOptions }
  }

  private getRetro3LinkButton () {
    const options: Retro3LinkButtonOptions = {
      isDisplayed: this.options.retro3Link,
      shortUUID: this.options.videoShortUUID,
      instanceName: this.options.instanceName
    }

    return { retro3LinkButton: options }
  }

  private getTheaterButton () {
    const options: TheaterButtonOptions = {
      isDisplayed: () => this.options.theaterButton
    }

    return {
      theaterButton: options
    }
  }
}
