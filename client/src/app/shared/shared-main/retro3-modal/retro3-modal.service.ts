import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class Retro3ModalService {
  openQuickSettingsSubject = new Subject<void>()
}
