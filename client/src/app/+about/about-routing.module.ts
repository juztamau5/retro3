import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AboutFollowsComponent } from '@app/+about/about-follows/about-follows.component'
import { AboutInstanceComponent } from '@app/+about/about-instance/about-instance.component'
import { AboutInstanceResolver } from '@app/+about/about-instance/about-instance.resolver'
import { AboutRetro3Component } from '@app/+about/about-retro3/about-retro3.component'
import { AboutComponent } from './about.component'

const aboutRoutes: Routes = [
  {
    path: '',
    component: AboutComponent,
    children: [
      {
        path: '',
        redirectTo: 'instance',
        pathMatch: 'full'
      },
      {
        path: 'instance',
        component: AboutInstanceComponent,
        data: {
          meta: {
            title: $localize`About this instance`
          }
        },
        resolve: {
          instanceData: AboutInstanceResolver
        }
      },
      {
        path: 'contact',
        component: AboutInstanceComponent,
        data: {
          meta: {
            title: $localize`Contact`
          },
          isContact: true
        },
        resolve: {
          instanceData: AboutInstanceResolver
        }
      },
      {
        path: 'retro3',
        component: AboutRetro3Component,
        data: {
          meta: {
            title: $localize`About retro3`
          }
        }
      },
      {
        path: 'follows',
        component: AboutFollowsComponent,
        data: {
          meta: {
            title: $localize`About this instance's network`
          }
        }
      }
    ]
  }
]

@NgModule({
  imports: [ RouterModule.forChild(aboutRoutes) ],
  exports: [ RouterModule ]
})
export class AboutRoutingModule {}
