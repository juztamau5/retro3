import { PluginType_Type } from '../plugin.type.js'

export interface Retro3PluginIndexList {
  start: number
  count: number
  sort: string
  pluginType?: PluginType_Type
  currentRetro3Engine?: string
  search?: string
}
