/*
 * Copyright (C) 2024 retro.ai
 * This file is part of retro3 - https://github.com/juztamau5/retro3
 *
 * This file is derived from the PeerTube project under the the AGPLv3 license.
 * https://joinpeertube.org
 *
 * SPDX-License-Identifier: AGPL-3.0
 * See the file LICENSE.txt for more information.
 */

import { ApplicationRef, enableProdMode } from '@angular/core'
import { enableDebugTools } from '@angular/platform-browser'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import { logger } from './root-helpers'

if (environment.production) {
  enableProdMode()
}

logger.registerServerSending(environment.apiUrl)

const bootstrap = () => platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(bootstrapModule => {
    if (!environment.production) {
      const applicationRef = bootstrapModule.injector.get(ApplicationRef)
      const componentRef = applicationRef.components[0]

      // allows to run `ng.profiler.timeChangeDetection();`
      enableDebugTools(componentRef)
    }

    return bootstrapModule
  })
  .catch(err => {
    try {
      logger.error(err)
    } catch (err2) {
      console.error('Cannot log error', { err, err2 })
    }

    // Ensure we display an "incompatible message" on Angular bootstrap error
    setTimeout(() => {
      if (document.querySelector('my-app').innerHTML === '') {
        throw err
      }
    }, 1000)

    return null
  })

bootstrap()
