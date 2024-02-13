import { Op, Transaction } from 'sequelize'
import { AllowNull, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { VideoPrivacy } from '@retroai/retro3-models'
import { MScheduleVideoUpdate, MScheduleVideoUpdateFormattable } from '@server/types/models/index.js'
import { AttributesOnly } from '@retroai/retro3-typescript-utils'
import { VideoModel } from './video.js'

@Table({
  tableName: 'scheduleVideoUpdate',
  indexes: [
    {
      fields: [ 'videoId' ],
      unique: true
    },
    {
      fields: [ 'updateAt' ]
    }
  ]
})
export class ScheduleVideoUpdateModel extends Model<Partial<AttributesOnly<ScheduleVideoUpdateModel>>> {

  @AllowNull(false)
  @Default(null)
  @Column
  updateAt: Date

  @AllowNull(true)
  @Default(null)
  @Column(DataType.INTEGER)
  privacy: typeof VideoPrivacy.PUBLIC | typeof VideoPrivacy.UNLISTED | typeof VideoPrivacy.INTERNAL

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @ForeignKey(() => VideoModel)
  @Column
  videoId: number

  @BelongsTo(() => VideoModel, {
    foreignKey: {
      allowNull: false
    },
    onDelete: 'cascade'
  })
  Video: Awaited<VideoModel>

  static areVideosToUpdate () {
    const query = {
      logging: false,
      attributes: [ 'id' ],
      where: {
        updateAt: {
          [Op.lte]: new Date()
        }
      }
    }

    return ScheduleVideoUpdateModel.findOne(query)
      .then(res => !!res)
  }

  static listVideosToUpdate (transaction?: Transaction) {
    const query = {
      where: {
        updateAt: {
          [Op.lte]: new Date()
        }
      },
      transaction
    }

    return ScheduleVideoUpdateModel.findAll<MScheduleVideoUpdate>(query)
  }

  static deleteByVideoId (videoId: number, t: Transaction) {
    const query = {
      where: {
        videoId
      },
      transaction: t
    }

    return ScheduleVideoUpdateModel.destroy(query)
  }

  toFormattedJSON (this: MScheduleVideoUpdateFormattable) {
    return {
      updateAt: this.updateAt,
      privacy: this.privacy || undefined
    }
  }
}
