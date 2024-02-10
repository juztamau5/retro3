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

import { EventHandler } from './definitions'

interface PlayerEventRegistrar {
  registrations: EventHandler<any>[]
}

interface PlayerEventRegistrationMap {
  [ name: string ]: PlayerEventRegistrar
}

export class EventRegistrar {

  private eventRegistrations: PlayerEventRegistrationMap = {}

  public bindToChannel (channel: Channel.MessagingChannel) {
    for (const name of Object.keys(this.eventRegistrations)) {
      channel.bind(name, (txn, params) => this.fire(name, params))
    }
  }

  public registerTypes (names: string[]) {
    for (const name of names) {
      this.eventRegistrations[name] = { registrations: [] }
    }
  }

  public fire<T> (name: string, event: T) {
    this.eventRegistrations[name].registrations.forEach(x => x(event))
  }

  public addListener<T> (name: string, handler: EventHandler<T>) {
    if (!this.eventRegistrations[name]) {
      console.warn(`retro3: addEventListener(): The event '${name}' is not supported`)
      return false
    }

    this.eventRegistrations[name].registrations.push(handler)
    return true
  }

  public removeListener<T> (name: string, handler: EventHandler<T>) {
    if (!this.eventRegistrations[name]) return false

    this.eventRegistrations[name].registrations = this.eventRegistrations[name].registrations.filter(x => x !== handler)

    return true
  }
}
