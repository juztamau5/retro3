import { Component, ElementRef, ViewChild } from '@angular/core'
import { Notifier, ServerService, User, UserService } from '@app/core'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'
import { logger } from '@root-helpers/logger'
import { retro3LocalStorage } from '@root-helpers/retro3-web-storage'

@Component({
  selector: 'my-account-setup-warning-modal',
  templateUrl: './account-setup-warning-modal.component.html',
  styleUrls: [ './account-setup-warning-modal.component.scss' ]
})
export class AccountSetupWarningModalComponent {
  @ViewChild('modal', { static: true }) modal: ElementRef

  stopDisplayModal = false
  ref: NgbModalRef

  user: User

  private LOCAL_STORAGE_KEYS = {
    NO_ACCOUNT_SETUP_WARNING_MODAL: 'no_account_setup_warning_modal'
  }

  constructor (
    private userService: UserService,
    private modalService: NgbModal,
    private notifier: Notifier,
    private serverService: ServerService
  ) { }

  get instanceName () {
    return this.serverService.getHTMLConfig().instance.name
  }

  hasAccountAvatar (user: User) {
    return user.account.avatars.length !== 0
  }

  hasAccountDescription (user: User) {
    return !!user.account.description
  }

  shouldOpen (user: User) {
    if (user.noAccountSetupWarningModal === true) return false
    if (retro3LocalStorage.getItem(this.LOCAL_STORAGE_KEYS.NO_ACCOUNT_SETUP_WARNING_MODAL) === 'true') return false

    if (this.hasAccountAvatar(user) && this.hasAccountDescription(user)) return false
    if (this.userService.hasSignupInThisSession()) return false

    return true
  }

  show (user: User) {
    this.user = user

    if (this.ref) return

    this.ref = this.modalService.open(this.modal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'md'
    })

    this.ref.result.finally(() => {
      if (this.stopDisplayModal === true) this.doNotOpenAgain()
    })
  }

  private doNotOpenAgain () {
    retro3LocalStorage.setItem(this.LOCAL_STORAGE_KEYS.NO_ACCOUNT_SETUP_WARNING_MODAL, 'true')

    this.userService.updateMyProfile({ noAccountSetupWarningModal: true })
        .subscribe({
          next: () => logger.info('We will not open the account setup modal again.'),

          error: err => this.notifier.error(err.message)
        })
  }
}
