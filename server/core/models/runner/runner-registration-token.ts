import { FindOptions, literal } from 'sequelize'
import { AllowNull, Column, CreatedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { MRunnerRegistrationToken } from '@server/types/models/runners/index.js'
import { RunnerRegistrationToken } from '@retroai/retro3-models'
import { AttributesOnly } from '@retroai/retro3-typescript-utils'
import { getSort } from '../shared/index.js'
import { RunnerModel } from './runner.js'

/**
 *
 * Tokens used by retro3 runners to register themselves to the retro3 instance
 *
 */

@Table({
  tableName: 'runnerRegistrationToken',
  indexes: [
    {
      fields: [ 'registrationToken' ],
      unique: true
    }
  ]
})
export class RunnerRegistrationTokenModel extends Model<Partial<AttributesOnly<RunnerRegistrationTokenModel>>> {

  @AllowNull(false)
  @Column
  registrationToken: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @HasMany(() => RunnerModel, {
    foreignKey: {
      allowNull: true
    },
    onDelete: 'cascade'
  })
  Runners: Awaited<RunnerModel>[]

  static load (id: number) {
    return RunnerRegistrationTokenModel.findByPk(id)
  }

  static loadByRegistrationToken (registrationToken: string) {
    const query = {
      where: { registrationToken }
    }

    return RunnerRegistrationTokenModel.findOne(query)
  }

  static countTotal () {
    return RunnerRegistrationTokenModel.unscoped().count()
  }

  static listForApi (options: {
    start: number
    count: number
    sort: string
  }) {
    const { start, count, sort } = options

    const query: FindOptions = {
      attributes: {
        include: [
          [
            literal('(SELECT COUNT(*) FROM "runner" WHERE "runner"."runnerRegistrationTokenId" = "RunnerRegistrationTokenModel"."id")'),
            'registeredRunnersCount'
          ]
        ]
      },
      offset: start,
      limit: count,
      order: getSort(sort)
    }

    return Promise.all([
      RunnerRegistrationTokenModel.count(query),
      RunnerRegistrationTokenModel.findAll<MRunnerRegistrationToken>(query)
    ]).then(([ total, data ]) => ({ total, data }))
  }

  // ---------------------------------------------------------------------------

  toFormattedJSON (this: MRunnerRegistrationToken): RunnerRegistrationToken {
    const registeredRunnersCount = this.get('registeredRunnersCount') as number

    return {
      id: this.id,

      registrationToken: this.registrationToken,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,

      registeredRunnersCount
    }
  }
}
