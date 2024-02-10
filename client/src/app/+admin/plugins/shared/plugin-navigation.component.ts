import { Component, Input } from '@angular/core'
import { PluginType_Type } from '@retroai/retro3-models'

@Component({
  selector: 'my-plugin-navigation',
  templateUrl: './plugin-navigation.component.html',
  styleUrls: [ './plugin-navigation.component.scss' ]
})
export class PluginNavigationComponent {
  @Input() pluginType: PluginType_Type
}
