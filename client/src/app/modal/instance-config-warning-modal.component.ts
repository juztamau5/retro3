import { Location } from '@angular/common'
import { Component, ElementRef, ViewChild } from '@angular/core'
import { Notifier, User, UserService } from '@app/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { About, ServerConfig } from '@retroai/retro3-models'
import { logger } from '@root-helpers/logger'
import { retro3LocalStorage } from '@root-helpers/retro3-web-storage'

@Component({
  selector: 'my-instance-config-warning-modal',
  templateUrl: './instance-config-warning-modal.component.html',
  styleUrls: [ './instance-config-warning-modal.component.scss' ]
})
export class InstanceConfigWarningModalComponent {
  @ViewChild('modal', { static: true }) modal: ElementRef

  stopDisplayModal = false
  about: About

  private LOCAL_STORAGE_KEYS = {
    NO_INSTANCE_CONFIG_WARNING_MODAL: 'no_instance_config_warning_modal'
  }

  constructor (
    private userService: UserService,
    private location: Location,
    private modalService: NgbModal,
    private notifier: Notifier
  ) { }

  shouldOpenByUser (user: User) {
    if (user.noInstanceConfigWarningModal === true) return false
    if (retro3LocalStorage.getItem(this.LOCAL_STORAGE_KEYS.NO_INSTANCE_CONFIG_WARNING_MODAL) === 'true') return false

    return true
  }

  shouldOpen (serverConfig: ServerConfig, about: About) {
    if (!serverConfig.signup.allowed) return false

    return serverConfig.instance.name.toLowerCase() === 'retro3' ||
      !about.instance.terms ||
      !about.instance.administrator ||
      !about.instance.maintenanceLifetime
  }

  show (about: About) {
    if (this.location.path().startsWith('/admin/config/edit-custom')) return

    this.about = about

    const ref = this.modalService.open(this.modal, { centered: true })

    ref.result.finally(() => {
      if (this.stopDisplayModal === true) this.doNotOpenAgain()
    })
  }

  isDefaultShortDescription (description: string) {
    return description === 'retro3, an ActivityPub-federated video and game streaming platform using P2P directly in your web browser.'
  }

  private doNotOpenAgain () {
    retro3LocalStorage.setItem(this.LOCAL_STORAGE_KEYS.NO_INSTANCE_CONFIG_WARNING_MODAL, 'true')

    this.userService.updateMyProfile({ noInstanceConfigWarningModal: true })
        .subscribe({
          next: () => logger.info('We will not open the instance config warning modal again.'),

          error: err => this.notifier.error(err.message)
        })
  }
}
