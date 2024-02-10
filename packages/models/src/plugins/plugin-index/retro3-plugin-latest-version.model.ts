export interface Retro3PluginLatestVersionRequest {
  currentRetro3Engine?: string

  npmNames: string[]
}

export type Retro3PluginLatestVersionResponse = {
  npmName: string
  latestVersion: string | null
}[]
