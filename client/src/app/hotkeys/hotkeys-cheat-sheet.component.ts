import { Subscription } from 'rxjs'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { LocalStorageService, HotkeysService, Hotkey } from '@app/core'

@Component({
  selector: 'my-hotkeys-cheat-sheet',
  templateUrl: './hotkeys-cheat-sheet.component.html',
  styleUrls: [ './hotkeys-cheat-sheet.component.scss' ]
})
export class HotkeysCheatSheetComponent implements OnInit, OnDestroy {
  @Input() title = $localize`Keyboard Shortcuts`

  @Output() hotkeysModalStateChange = new EventEmitter<boolean>()

  hotkeysEnabled = true

  helpVisible = false
  subscription: Subscription

  hotkeys: Hotkey[]

  private readonly localStorageHotkeysDisabledKey = 'retro3-hotkeys-disabled'

  constructor (
    private hotkeysService: HotkeysService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit () {
    if (this.localStorage.getItem(this.localStorageHotkeysDisabledKey) === 'true') {
      this.hotkeysEnabled = false
      this.hotkeysService.disableHotkeys()
    }

    this.subscription = this.hotkeysService.cheatSheetToggle.subscribe(isOpen => {
      if (isOpen !== false) {
        this.hotkeys = this.hotkeysService.getHotkeys().filter(hotkey => hotkey.description)
      }

      if (isOpen === false) {
        this.helpVisible = false
      } else {
        this.toggleHelpVisible()
      }

      this.hotkeysModalStateChange.emit(this.helpVisible)
    })
  }

  ngOnDestroy () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  toggleCheatSheet () {
    this.hotkeysService.cheatSheetToggle.next(!this.helpVisible)
  }

  toggleHelpVisible () {
    this.helpVisible = !this.helpVisible
  }

  onHotkeysEnabledChange () {
    if (!this.hotkeysEnabled) {
      this.localStorage.setItem(this.localStorageHotkeysDisabledKey, 'true')
      this.hotkeysService.disableHotkeys()
      return
    }

    this.hotkeysService.enableHotkeys()
    this.localStorage.removeItem(this.localStorageHotkeysDisabledKey)
  }
}
