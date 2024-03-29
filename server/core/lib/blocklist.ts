import { sequelizeTypescript } from '@server/initializers/database.js'
import { getServerActor } from '@server/models/application/application.js'
import { MAccountBlocklist, MAccountId, MAccountHost, MServerBlocklist } from '@server/types/models/index.js'
import { AccountBlocklistModel } from '../models/account/account-blocklist.js'
import { ServerBlocklistModel } from '../models/server/server-blocklist.js'

function addAccountInBlocklist (byAccountId: number, targetAccountId: number) {
  return sequelizeTypescript.transaction(async t => {
    return AccountBlocklistModel.upsert({
      accountId: byAccountId,
      targetAccountId
    }, { transaction: t })
  })
}

function addServerInBlocklist (byAccountId: number, targetServerId: number) {
  return sequelizeTypescript.transaction(async t => {
    return ServerBlocklistModel.upsert({
      accountId: byAccountId,
      targetServerId
    }, { transaction: t })
  })
}

function removeAccountFromBlocklist (accountBlock: MAccountBlocklist) {
  return sequelizeTypescript.transaction(async t => {
    return accountBlock.destroy({ transaction: t })
  })
}

function removeServerFromBlocklist (serverBlock: MServerBlocklist) {
  return sequelizeTypescript.transaction(async t => {
    return serverBlock.destroy({ transaction: t })
  })
}

async function isBlockedByServerOrAccount (targetAccount: MAccountHost, userAccount?: MAccountId) {
  const serverAccountId = (await getServerActor()).Account.id
  const sourceAccounts = [ serverAccountId ]

  if (userAccount) sourceAccounts.push(userAccount.id)

  const accountMutedHash = await AccountBlocklistModel.isAccountMutedByAccounts(sourceAccounts, targetAccount.id)
  if (accountMutedHash[serverAccountId] || (userAccount && accountMutedHash[userAccount.id])) {
    return true
  }

  const instanceMutedHash = await ServerBlocklistModel.isServerMutedByAccounts(sourceAccounts, targetAccount.Actor.serverId)
  if (instanceMutedHash[serverAccountId] || (userAccount && instanceMutedHash[userAccount.id])) {
    return true
  }

  return false
}

export {
  addAccountInBlocklist,
  addServerInBlocklist,
  removeAccountFromBlocklist,
  removeServerFromBlocklist,
  isBlockedByServerOrAccount
}
