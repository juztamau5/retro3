import videojs from 'video.js'

const Component = videojs.getComponent('Component')

export type Retro3DockComponentOptions = {
  title?: string
  description?: string
  avatarUrl?: string
}

class Retro3DockComponent extends Component {

  options_: videojs.ComponentOptions & Retro3DockComponentOptions

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (player: videojs.Player, options: videojs.ComponentOptions & Retro3DockComponentOptions) {
    super(player, options)
  }

  createEl () {
    const el = super.createEl('div', { className: 'retro3-dock' })

    if (this.options_.avatarUrl) {
      const avatar = videojs.dom.createEl('img', {
        className: 'retro3-dock-avatar',
        src: this.options_.avatarUrl
      })

      el.appendChild(avatar)
    }

    const elWrapperTitleDescription = super.createEl('div', {
      className: 'retro3-dock-title-description'
    })

    if (this.options_.title) {
      const title = videojs.dom.createEl('div', {
        className: 'retro3-dock-title',
        title: this.options_.title,
        innerHTML: this.options_.title
      })

      elWrapperTitleDescription.appendChild(title)
    }

    if (this.options_.description) {
      const description = videojs.dom.createEl('div', {
        className: 'retro3-dock-description',
        title: this.options_.description,
        innerHTML: this.options_.description
      })

      elWrapperTitleDescription.appendChild(description)
    }

    if (this.options_.title || this.options_.description) {
      el.appendChild(elWrapperTitleDescription)
    }

    return el
  }
}

videojs.registerComponent('Retro3DockComponent', Retro3DockComponent)

export {
  Retro3DockComponent
}
