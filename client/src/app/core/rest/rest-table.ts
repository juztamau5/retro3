import debug from 'debug'
import { SortMeta } from 'primeng/api'
import { TableLazyLoadEvent } from 'primeng/table'
import { ActivatedRoute, Router } from '@angular/router'
import { logger } from '@root-helpers/logger'
import { retro3LocalStorage } from '@root-helpers/retro3-web-storage'
import { RestPagination } from './rest-pagination'

const debugLogger = debug('retro3:tables:RestTable')

export abstract class RestTable <T = unknown> {

  abstract totalRecords: number
  abstract sort: SortMeta
  abstract pagination: RestPagination

  rowsPerPageOptions = [ 10, 20, 50, 100 ]
  rowsPerPage = this.rowsPerPageOptions[0]
  expandedRows = {}

  selectedRows: T[] = []

  search: string

  sortTooltip = $localize`Sort by this column`

  protected route: ActivatedRoute
  protected router: Router

  abstract getIdentifier (): string

  initialize () {
    this.loadSort()
  }

  loadSort () {
    const result = retro3LocalStorage.getItem(this.getSortLocalStorageKey())

    if (result) {
      try {
        this.sort = JSON.parse(result)
      } catch (err) {
        logger.error('Cannot load sort of local storage key ' + this.getSortLocalStorageKey(), err)
      }
    }
  }

  saveSort () {
    retro3LocalStorage.setItem(this.getSortLocalStorageKey(), JSON.stringify(this.sort))
  }

  loadLazy (event: TableLazyLoadEvent) {
    debugLogger('Load lazy %o.', event)

    this.sort = {
      order: event.sortOrder,
      field: event.sortField as string
    }

    this.rowsPerPage = event.rows

    this.pagination = {
      start: event.first,
      count: this.rowsPerPage
    }

    this.expandedRows = {}

    this.reloadData()
    this.saveSort()
  }

  onSearch (search: string) {
    this.pagination = {
      start: 0,
      count: this.rowsPerPage
    }

    this.search = search
    this.reloadData()
  }

  isInSelectionMode () {
    return this.selectedRows.length !== 0
  }

  getPaginationTemplate () {
    return $localize`{first} - {last} of {totalRecords}`
  }

  protected abstract reloadDataInternal (): void

  protected reloadData () {
    this.selectedRows = []

    this.reloadDataInternal()
  }

  private getSortLocalStorageKey () {
    return 'rest-table-sort-' + this.getIdentifier()
  }
}
