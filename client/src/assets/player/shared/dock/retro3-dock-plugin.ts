import videojs from 'video.js'
import { Retro3DockComponent } from './retro3-dock-component'

const Plugin = videojs.getPlugin('plugin')

export type Retro3DockPluginOptions = {
  title?: string
  description?: string
  avatarUrl?: string
}

class Retro3DockPlugin extends Plugin {
  private dockComponent: Retro3DockComponent

  constructor (player: videojs.Player, options: videojs.PlayerOptions & Retro3DockPluginOptions) {
    super(player, options)

    player.ready(() => {
      player.addClass('retro3-dock')
    })

    this.dockComponent = new Retro3DockComponent(player, options)
    player.addChild(this.dockComponent)
  }

  dispose () {
    this.dockComponent?.dispose()
    this.player.removeChild(this.dockComponent)
    this.player.removeClass('retro3-dock')

    super.dispose()
  }
}

videojs.registerPlugin('retro3Dock', Retro3DockPlugin)
export { Retro3DockPlugin }
