import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AccountVideoChannelsComponent } from './account-video-channels/account-video-channels.component'
import { AccountVideosComponent } from './account-videos/account-videos.component'
import { AccountsComponent } from './accounts.component'

const accountsRoutes: Routes = [
  {
    path: 'retro3',
    redirectTo: '/videos/local'
  },
  {
    path: ':accountId',
    component: AccountsComponent,
    children: [
      {
        path: '',
        redirectTo: 'video-channels',
        pathMatch: 'full'
      },
      {
        path: 'video-channels',
        component: AccountVideoChannelsComponent,
        data: {
          meta: {
            title: $localize`Account video channels`
          }
        }
      },
      {
        path: 'videos',
        component: AccountVideosComponent,
        data: {
          meta: {
            title: $localize`Account videos`
          },
          reuse: {
            enabled: true,
            key: 'account-videos-list'
          }
        }
      },

      // Old URL redirection
      {
        path: 'search',
        redirectTo: 'videos'
      }
    ]
  }
]

@NgModule({
  imports: [ RouterModule.forChild(accountsRoutes) ],
  exports: [ RouterModule ]
})
export class AccountsRoutingModule {}
