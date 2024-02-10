import { Component, AfterViewChecked } from '@angular/core'
import { ViewportScroller } from '@angular/common'

@Component({
  selector: 'my-about-retro3',
  templateUrl: './about-retro3.component.html',
  styleUrls: [ './about-retro3.component.scss' ]
})

export class AboutRetro3Component implements AfterViewChecked {
  private lastScrollHash: string

  constructor (
    private viewportScroller: ViewportScroller
  ) {}

  ngAfterViewChecked () {
    if (window.location.hash && window.location.hash !== this.lastScrollHash) {
      this.viewportScroller.scrollToAnchor(window.location.hash.replace('#', ''))

      this.lastScrollHash = window.location.hash
    }
  }
}
