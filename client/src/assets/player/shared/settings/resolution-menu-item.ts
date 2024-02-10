import videojs from 'video.js'

const MenuItem = videojs.getComponent('MenuItem')

export interface ResolutionMenuItemOptions extends videojs.MenuItemOptions {
  resolutionId: number
}

class ResolutionMenuItem extends MenuItem {
  readonly resolutionId: number
  private readonly label: string

  private autoResolutionChosen: string

  private updateSelectionHandler: () => void

  constructor (player: videojs.Player, options?: ResolutionMenuItemOptions) {
    super(player, { ...options, selectable: true })

    this.autoResolutionChosen = ''

    this.resolutionId = options.resolutionId
    this.label = options.label

    this.updateSelectionHandler = () => this.updateSelection()
    player.retro3Resolutions().on('resolutions-changed', this.updateSelectionHandler)
  }

  dispose () {
    this.player().retro3Resolutions().off('resolutions-changed', this.updateSelectionHandler)

    super.dispose()
  }

  handleClick (event: any) {
    super.handleClick(event)

    this.player().retro3Resolutions().select({ id: this.resolutionId, fireCallback: true })
  }

  updateSelection () {
    const selectedResolution = this.player().retro3Resolutions().getSelected()

    if (this.resolutionId === -1) {
      this.autoResolutionChosen = this.player().retro3Resolutions().getAutoResolutionChosen()?.label
    }

    this.selected(this.resolutionId === selectedResolution.id)
  }

  getLabel () {
    if (this.resolutionId === -1) {
      return this.label + ' <small>' + this.autoResolutionChosen + '</small>'
    }

    return this.label
  }
}
videojs.registerComponent('ResolutionMenuItem', ResolutionMenuItem)

export { ResolutionMenuItem }
