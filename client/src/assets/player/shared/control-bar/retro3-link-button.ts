import videojs from 'video.js'
import { buildVideoLink, decorateVideoLink } from '@retroai/retro3-core-utils'
import { Retro3LinkButtonOptions } from '../../types'

const Component = videojs.getComponent('Component')

class Retro3LinkButton extends Component {
  private mouseEnterHandler: () => void
  private clickHandler: () => void

  options_: Retro3LinkButtonOptions & videojs.ComponentOptions

  constructor (player: videojs.Player, options?: Retro3LinkButtonOptions & videojs.ComponentOptions) {
    super(player, options)

    this.updateShowing()
    this.player().on('video-change', () => this.updateShowing())
  }

  dispose () {
    if (this.el()) return

    this.el().removeEventListener('mouseenter', this.mouseEnterHandler)
    this.el().removeEventListener('click', this.clickHandler)

    super.dispose()
  }

  createEl () {
    const el = videojs.dom.createEl('a', {
      href: this.buildLink(),
      innerHTML: this.options_.instanceName,
      title: this.player().localize('Video page (new window)'),
      className: 'vjs-retro3-link',
      target: '_blank'
    })

    this.mouseEnterHandler = () => this.updateHref()
    this.clickHandler = () => this.player().pause()

    el.addEventListener('mouseenter', this.mouseEnterHandler)
    el.addEventListener('click', this.clickHandler)

    return el
  }

  updateShowing () {
    if (this.options_.isDisplayed()) this.show()
    else this.hide()
  }

  updateHref () {
    this.el().setAttribute('href', this.buildLink())
  }

  private buildLink () {
    const url = buildVideoLink({ shortUUID: this.options_.shortUUID() })

    return decorateVideoLink({ url, startTime: this.player().currentTime() })
  }
}

videojs.registerComponent('Retro3LinkButton', Retro3LinkButton)
