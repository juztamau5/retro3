import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { HttpStatusCode, HttpStatusCodeType } from '@retroai/retro3-models'

@Component({
  selector: 'my-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: [ './error-page.component.scss' ]
})
export class ErrorPageComponent implements OnInit {
  status: HttpStatusCodeType = HttpStatusCode.NOT_FOUND_404
  type: 'video' | 'other' = 'other'

  public constructor (
    private titleService: Title,
    private router: Router
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state
    this.type = state?.type || this.type
    this.status = state?.obj.status || this.status
  }

  ngOnInit () {
    if (this.pathname.includes('teapot')) {
      this.status = HttpStatusCode.I_AM_A_TEAPOT_418
      this.titleService.setTitle($localize`I'm a teapot` + ' - retro3')
    }
  }

  get pathname () {
    return window.location.pathname
  }

  getMascotName () {
    switch (this.status) {
      case HttpStatusCode.I_AM_A_TEAPOT_418:
        return 'happy'
      case HttpStatusCode.FORBIDDEN_403:
        return 'arguing'
      case HttpStatusCode.NOT_FOUND_404:
      default:
        return 'defeated'
    }
  }
}
