import { pick } from '@retroai/retro3-core-utils'
import { ActivityPubActorType, ActorFollow, FollowState, HttpStatusCode, ResultList, ServerFollowCreate } from '@retroai/retro3-models'
import { AbstractCommand, OverrideCommandOptions } from '../shared/index.js'
import { Retro3Server } from './server.js'

export class FollowsCommand extends AbstractCommand {

  getFollowers (options: OverrideCommandOptions & {
    start?: number
    count?: number
    sort?: string
    search?: string
    actorType?: ActivityPubActorType
    state?: FollowState
  } = {}) {
    const path = '/api/v1/server/followers'

    const query = pick(options, [ 'start', 'count', 'sort', 'search', 'state', 'actorType' ])

    return this.getRequestBody<ResultList<ActorFollow>>({
      ...options,

      path,
      query,
      implicitToken: false,
      defaultExpectedStatus: HttpStatusCode.OK_200
    })
  }

  getFollowings (options: OverrideCommandOptions & {
    start?: number
    count?: number
    sort?: string
    search?: string
    actorType?: ActivityPubActorType
    state?: FollowState
  } = {}) {
    const path = '/api/v1/server/following'

    const query = pick(options, [ 'start', 'count', 'sort', 'search', 'state', 'actorType' ])

    return this.getRequestBody<ResultList<ActorFollow>>({
      ...options,

      path,
      query,
      implicitToken: false,
      defaultExpectedStatus: HttpStatusCode.OK_200
    })
  }

  follow (options: OverrideCommandOptions & {
    hosts?: string[]
    handles?: string[]
  }) {
    const path = '/api/v1/server/following'

    const fields: ServerFollowCreate = {}

    if (options.hosts) {
      fields.hosts = options.hosts.map(f => f.replace(/^http:\/\//, ''))
    }

    if (options.handles) {
      fields.handles = options.handles
    }

    return this.postBodyRequest({
      ...options,

      path,
      fields,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }

  async unfollow (options: OverrideCommandOptions & {
    target: Retro3Server | string
  }) {
    const { target } = options

    const handle = typeof target === 'string'
      ? target
      : target.host

    const path = '/api/v1/server/following/' + handle

    return this.deleteRequest({
      ...options,

      path,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }

  acceptFollower (options: OverrideCommandOptions & {
    follower: string
  }) {
    const path = '/api/v1/server/followers/' + options.follower + '/accept'

    return this.postBodyRequest({
      ...options,

      path,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }

  rejectFollower (options: OverrideCommandOptions & {
    follower: string
  }) {
    const path = '/api/v1/server/followers/' + options.follower + '/reject'

    return this.postBodyRequest({
      ...options,

      path,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }

  removeFollower (options: OverrideCommandOptions & {
    follower: Retro3Server
  }) {
    const path = '/api/v1/server/followers/retro3@' + options.follower.host

    return this.deleteRequest({
      ...options,

      path,
      implicitToken: true,
      defaultExpectedStatus: HttpStatusCode.NO_CONTENT_204
    })
  }
}
