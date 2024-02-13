import { Component, Input } from '@angular/core'
import { Retro3Plugin, Retro3PluginIndex, PluginType_Type } from '@retroai/retro3-models'
import { PluginApiService } from './plugin-api.service'

@Component({
  selector: 'my-plugin-card',
  templateUrl: './plugin-card.component.html',
  styleUrls: [ './plugin-card.component.scss' ]
})

export class PluginCardComponent {
  @Input() plugin: Retro3PluginIndex | Retro3Plugin
  @Input() version: string
  @Input() pluginType: PluginType_Type

  constructor (
    private pluginApiService: PluginApiService
  ) {
  }

  getPluginOrThemeHref (name: string) {
    return this.pluginApiService.getPluginOrThemeHref(this.pluginType, name)
  }
}
