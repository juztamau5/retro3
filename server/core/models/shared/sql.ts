import { literal, Model, ModelStatic } from 'sequelize'
import { Literal } from 'sequelize/types/utils'
import { forceNumber } from '@retroai/retro3-core-utils'
import { AttributesOnly } from '@retroai/retro3-typescript-utils'

// FIXME: have to specify the result type to not break retro3 typings generation
function buildLocalAccountIdsIn (): Literal {
  return literal(
    '(SELECT "account"."id" FROM "account" INNER JOIN "actor" ON "actor"."id" = "account"."actorId" AND "actor"."serverId" IS NULL)'
  )
}

// FIXME: have to specify the result type to not break retro3 typings generation
function buildLocalActorIdsIn (): Literal {
  return literal(
    '(SELECT "actor"."id" FROM "actor" WHERE "actor"."serverId" IS NULL)'
  )
}

function buildBlockedAccountSQL (blockerIds: number[]) {
  const blockerIdsString = blockerIds.join(', ')

  return 'SELECT "targetAccountId" AS "id" FROM "accountBlocklist" WHERE "accountId" IN (' + blockerIdsString + ')' +
    ' UNION ' +
    'SELECT "account"."id" AS "id" FROM account INNER JOIN "actor" ON account."actorId" = actor.id ' +
    'INNER JOIN "serverBlocklist" ON "actor"."serverId" = "serverBlocklist"."targetServerId" ' +
    'WHERE "serverBlocklist"."accountId" IN (' + blockerIdsString + ')'
}

function buildServerIdsFollowedBy (actorId: any) {
  const actorIdNumber = forceNumber(actorId)

  return '(' +
    'SELECT "actor"."serverId" FROM "actorFollow" ' +
    'INNER JOIN "actor" ON actor.id = "actorFollow"."targetActorId" ' +
    'WHERE "actorFollow"."actorId" = ' + actorIdNumber +
    ')'
}

function buildSQLAttributes<M extends Model> (options: {
  model: ModelStatic<M>
  tableName: string

  excludeAttributes?: Exclude<keyof AttributesOnly<M>, symbol>[]
  aliasPrefix?: string
}) {
  const { model, tableName, aliasPrefix, excludeAttributes } = options

  const attributes = Object.keys(model.getAttributes()) as Exclude<keyof AttributesOnly<M>, symbol>[]

  return attributes
    .filter(a => {
      if (!excludeAttributes) return true
      if (excludeAttributes.includes(a)) return false

      return true
    })
    .map(a => {
      return `"${tableName}"."${a}" AS "${aliasPrefix || ''}${a}"`
    })
}

// ---------------------------------------------------------------------------

export {
  buildSQLAttributes,
  buildBlockedAccountSQL,
  buildServerIdsFollowedBy,
  buildLocalAccountIdsIn,
  buildLocalActorIdsIn
}
