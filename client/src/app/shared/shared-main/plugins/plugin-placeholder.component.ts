import { Component, Input } from '@angular/core'
import { PluginElementPlaceholder } from '@retroai/retro3-models'

@Component({
  selector: 'my-plugin-placeholder',
  template: '<div [id]="getId()"></div>',
  styleUrls: [ './plugin-placeholder.component.scss' ]
})

export class PluginPlaceholderComponent {
  @Input() pluginId: PluginElementPlaceholder

  getId () {
    return 'plugin-placeholder-' + this.pluginId
  }
}
