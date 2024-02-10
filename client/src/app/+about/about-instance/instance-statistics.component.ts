import { Component, Input } from '@angular/core'
import { ServerStats } from '@retroai/retro3-models'

@Component({
  selector: 'my-instance-statistics',
  templateUrl: './instance-statistics.component.html',
  styleUrls: [ './instance-statistics.component.scss' ]
})
export class InstanceStatisticsComponent {
  @Input() serverStats: ServerStats
}
