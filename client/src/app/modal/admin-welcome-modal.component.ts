import { Component, ElementRef, ViewChild } from '@angular/core'
import { Notifier, User, UserService } from '@app/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { logger } from '@root-helpers/logger'
import { retro3LocalStorage } from '@root-helpers/retro3-web-storage'

@Component({
  selector: 'my-admin-welcome-modal',
  templateUrl: './admin-welcome-modal.component.html',
  styleUrls: [ './admin-welcome-modal.component.scss' ]
})
export class AdminWelcomeModalComponent {
  @ViewChild('modal', { static: true }) modal: ElementRef

  private LOCAL_STORAGE_KEYS = {
    NO_WELCOME_MODAL: 'no_welcome_modal'
  }

  constructor (
    private userService: UserService,
    private modalService: NgbModal,
    private notifier: Notifier
  ) { }

  shouldOpen (user: User) {
    if (user.noWelcomeModal === true) return false
    if (retro3LocalStorage.getItem(this.LOCAL_STORAGE_KEYS.NO_WELCOME_MODAL) === 'true') return false

    return true
  }

  show () {
    this.modalService.open(this.modal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    })
  }

  doNotOpenAgain () {
    retro3LocalStorage.setItem(this.LOCAL_STORAGE_KEYS.NO_WELCOME_MODAL, 'true')

    this.userService.updateMyProfile({ noWelcomeModal: true })
      .subscribe({
        next: () => logger.info('We will not open the welcome modal again.'),

        error: err => this.notifier.error(err.message)
      })
  }
}
