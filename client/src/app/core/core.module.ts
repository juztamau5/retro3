import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { CommonModule } from '@angular/common'
import { NgModule, Optional, SkipSelf } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Retro3Socket } from '@app/core/notification/retro3-socket.service'
import { HooksService, PluginService } from '@app/core/plugins'
import { AuthService } from './auth'
import { ConfirmService } from './confirm'
import { MenuService } from './menu'
import { throwIfAlreadyLoaded } from './module-import-guard'
import { Notifier } from './notification'
import { HtmlRendererService, LinkifierService, MarkdownService } from './renderer'
import { RestExtractor, RestService } from './rest'
import {
  HomepageRedirectComponent,
  LoginGuard,
  MetaGuard,
  MetaService,
  Retro3RouterService,
  RedirectService,
  ScrollService,
  UnloggedGuard,
  UserRightGuard
} from './routing'
import { CanDeactivateGuard } from './routing/can-deactivate-guard.service'
import { ServerConfigResolver } from './routing/server-config-resolver.service'
import { ScopedTokensService } from './scoped-tokens'
import { ServerService } from './server'
import { ThemeService } from './theme'
import { UserLocalStorageService, UserService } from './users'
import { LocalStorageService, ScreenService, SessionStorageService } from './wrappers'
import { HotkeysService } from './hotkeys'

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,

    ToastModule
  ],

  declarations: [
    HomepageRedirectComponent
  ],

  exports: [
    ToastModule,

    HomepageRedirectComponent
  ],

  providers: [
    AuthService,
    ScopedTokensService,
    ConfirmService,
    ServerService,
    ThemeService,
    MenuService,
    LoginGuard,
    UserRightGuard,
    UnloggedGuard,

    PluginService,
    HooksService,

    HtmlRendererService,
    LinkifierService,
    MarkdownService,

    RestExtractor,
    RestService,

    UserService,
    UserLocalStorageService,

    ScreenService,
    LocalStorageService,
    SessionStorageService,

    RedirectService,
    Notifier,
    MessageService,
    Retro3Socket,
    ServerConfigResolver,
    CanDeactivateGuard,
    Retro3RouterService,
    ScrollService,

    MetaService,
    MetaGuard,

    HotkeysService
  ]
})
export class CoreModule {
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule')
  }
}
