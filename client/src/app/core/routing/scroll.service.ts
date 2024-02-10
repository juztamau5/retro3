import * as debug from 'debug'
import { pairwise } from 'rxjs'
import { ViewportScroller } from '@angular/common'
import { Injectable } from '@angular/core'
import { RouterSetting } from '../'
import { Retro3RouterService } from './retro3-router.service'
import { logger } from '@root-helpers/logger'

const debugLogger = debug('retro3:main:ScrollService')

@Injectable()
export class ScrollService {

  private resetScroll = true

  constructor (
    private viewportScroller: ViewportScroller,
    private retro3Router: Retro3RouterService
  ) { }

  enableScrollRestoration () {
    // We'll manage scroll restoration ourselves
    this.viewportScroller.setHistoryScrollRestoration('manual')

    this.consumeScroll()
    this.produceScroll()
  }

  private produceScroll () {
    // When we add the a-state parameter, we don't want to alter the scroll
    this.retro3Router.getNavigationEndEvents().pipe(pairwise())
                      .subscribe(([ e1, e2 ]) => {
                        try {
                          this.resetScroll = false

                          const previousUrl = new URL(window.location.origin + e1.urlAfterRedirects)
                          const nextUrl = new URL(window.location.origin + e2.urlAfterRedirects)

                          if (previousUrl.pathname !== nextUrl.pathname) {
                            this.resetScroll = true
                            return
                          }

                          if (this.retro3Router.hasRouteSetting(RouterSetting.DISABLE_SCROLL_RESTORE)) {
                            this.resetScroll = false
                            return
                          }

                          // Remove route settings from the comparison
                          const nextSearchParams = nextUrl.searchParams
                          nextSearchParams.delete(Retro3RouterService.ROUTE_SETTING_NAME)

                          const previousSearchParams = previousUrl.searchParams

                          nextSearchParams.sort()
                          previousSearchParams.sort()

                          if (nextSearchParams.toString() !== previousSearchParams.toString()) {
                            this.resetScroll = true
                          }
                        } catch (err) {
                          logger.error('Cannot parse URL to check next scroll.', err)
                          this.resetScroll = true
                        }
                      })
  }

  private consumeScroll () {
    // Handle anchors/restore position
    this.retro3Router.getScrollEvents().subscribe(e => {
      debugLogger('Will schedule scroll after router event %o.', { e, resetScroll: this.resetScroll })

      // scrollToAnchor first to preserve anchor position when using history navigation
      if (e.anchor) {
        setTimeout(() => this.viewportScroller.scrollToAnchor(e.anchor))

        return
      }

      if (e.position) {
        setTimeout(() => this.viewportScroller.scrollToPosition(e.position))

        return
      }

      if (this.resetScroll) {
        return this.viewportScroller.scrollToPosition([ 0, 0 ])
      }
    })
  }

}
