import { Subject } from 'rxjs'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PluginApiService } from '@app/+admin/plugins/shared/plugin-api.service'
import { ComponentPagination, ConfirmService, hasMoreItems, Notifier } from '@app/core'
import { PluginService } from '@app/core/plugins/plugin.service'
import { compareSemVer } from '@retroai/retro3-core-utils'
import { Retro3Plugin, PluginType, PluginType_Type } from '@retroai/retro3-models'

@Component({
  selector: 'my-plugin-list-installed',
  templateUrl: './plugin-list-installed.component.html',
  styleUrls: [ './plugin-list-installed.component.scss' ]
})
export class PluginListInstalledComponent implements OnInit {
  pluginType: PluginType_Type

  pagination: ComponentPagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: null
  }
  sort = 'name'

  plugins: Retro3Plugin[] = []
  updating: { [name: string]: boolean } = {}
  uninstalling: { [name: string]: boolean } = {}

  onDataSubject = new Subject<any[]>()

  constructor (
    private pluginService: PluginService,
    private pluginApiService: PluginApiService,
    private notifier: Notifier,
    private confirmService: ConfirmService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit () {
    if (!this.route.snapshot.queryParams['pluginType']) {
      const queryParams = { pluginType: PluginType.PLUGIN }

      this.router.navigate([], { queryParams, replaceUrl: true })
    }

    this.route.queryParams.subscribe(query => {
      if (!query['pluginType']) return

      this.pluginType = parseInt(query['pluginType'], 10) as PluginType_Type

      this.reloadPlugins()
    })
  }

  reloadPlugins () {
    this.pagination.currentPage = 1
    this.plugins = []

    this.loadMorePlugins()
  }

  loadMorePlugins () {
    this.pluginApiService.getPlugins(this.pluginType, this.pagination, this.sort)
        .subscribe({
          next: res => {
            this.plugins = this.plugins.concat(res.data)
            this.pagination.totalItems = res.total

            this.onDataSubject.next(res.data)
          },

          error: err => this.notifier.error(err.message)
        })
  }

  onNearOfBottom () {
    if (!hasMoreItems(this.pagination)) return

    this.pagination.currentPage += 1

    this.loadMorePlugins()
  }

  getNoResultMessage () {
    if (this.pluginType === PluginType.PLUGIN) {
      return $localize`You don't have plugins installed yet.`
    }

    return $localize`You don't have themes installed yet.`
  }

  isUpdateAvailable (plugin: Retro3Plugin) {
    return plugin.latestVersion && compareSemVer(plugin.latestVersion, plugin.version) > 0
  }

  getUpdateLabel (plugin: Retro3Plugin) {
    return $localize`Update to ${plugin.latestVersion}`
  }

  isUpdating (plugin: Retro3Plugin) {
    return !!this.updating[this.getPluginKey(plugin)]
  }

  isUninstalling (plugin: Retro3Plugin) {
    return !!this.uninstalling[this.getPluginKey(plugin)]
  }

  isTheme (plugin: Retro3Plugin) {
    return plugin.type === PluginType.THEME
  }

  async uninstall (plugin: Retro3Plugin) {
    const pluginKey = this.getPluginKey(plugin)
    if (this.uninstalling[pluginKey]) return

    const res = await this.confirmService.confirm(
      $localize`Do you really want to uninstall ${plugin.name}?`,
      $localize`Uninstall`
    )
    if (res === false) return

    this.uninstalling[pluginKey] = true

    this.pluginApiService.uninstall(plugin.name, plugin.type)
      .subscribe({
        next: () => {
          this.notifier.success($localize`${plugin.name} uninstalled.`)

          this.plugins = this.plugins.filter(p => p.name !== plugin.name)
          this.pagination.totalItems--

          this.uninstalling[pluginKey] = false
        },

        error: err => {
          this.notifier.error(err.message)
          this.uninstalling[pluginKey] = false
        }
      })
  }

  async update (plugin: Retro3Plugin) {
    const pluginKey = this.getPluginKey(plugin)
    if (this.updating[pluginKey]) return

    if (this.isMajorUpgrade(plugin)) {
      const res = await this.confirmService.confirm(
        $localize`This is a major plugin upgrade. Please go on the plugin homepage to check potential release notes.`,
        $localize`Upgrade`,
        $localize`Proceed upgrade`
      )

      if (res === false) return
    }

    this.updating[pluginKey] = true

    this.pluginApiService.update(plugin.name, plugin.type)
        .pipe()
        .subscribe({
          next: res => {
            this.updating[pluginKey] = false

            this.notifier.success($localize`${plugin.name} updated.`)

            Object.assign(plugin, res)
          },

          error: err => {
            this.notifier.error(err.message)
            this.updating[pluginKey] = false
          }
        })
  }

  getShowRouterLink (plugin: Retro3Plugin) {
    return [ '/admin', 'plugins', 'show', this.pluginService.nameToNpmName(plugin.name, plugin.type) ]
  }

  getPluginOrThemeHref (name: string) {
    return this.pluginApiService.getPluginOrThemeHref(this.pluginType, name)
  }

  private getPluginKey (plugin: Retro3Plugin) {
    return plugin.name + plugin.type
  }

  private isMajorUpgrade (plugin: Retro3Plugin) {
    if (!plugin.latestVersion) return false

    const latestMajor = plugin.latestVersion.split('.')[0]
    const currentMajor = plugin.version.split('.')[0]

    return latestMajor > currentMajor
  }
}
