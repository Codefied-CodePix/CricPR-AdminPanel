import { useState } from 'react'
import type { ReactNode } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Download } from 'lucide-react'
import { exportTableToCSV } from '../../utils/csv'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T
  filters?: {
    key: keyof T
    label: string
    options: { value: string; label: string }[]
  }[]
  onExport?: (data: T[]) => void
  exportFilename?: string
  actions?: (row: T) => ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  filters = [],
  onExport,
  exportFilename = 'export',
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const filteredData = data.filter((row) => {
    if (search && searchKey) {
      const value = String(row[searchKey]).toLowerCase()
      if (!value.includes(search.toLowerCase())) return false
    }
    return filters.every((filter) => {
      if (!filterValues[filter.key as string]) return true
      const filterValue = filterValues[filter.key as string]
      const rowValue = row[filter.key]
      
      // Handle boolean values (isWicketKeeper)
      if (filterValue === 'true' || filterValue === 'false') {
        return String(Boolean(rowValue)) === filterValue
      }
      
      return String(rowValue) === filterValue
    })
  })

  const handleExport = () => {
    if (onExport) {
      onExport(filteredData)
    } else {
      exportTableToCSV(filteredData, exportFilename)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-xl border border-borderShadcn/50">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          {searchKey && (
            <Input
              placeholder={`Search by ${String(searchKey)}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm border-2 focus:border-primary"
            />
          )}
          {filters.map((filter) => (
            <Select
              key={String(filter.key)}
              value={filterValues[filter.key as string] || ''}
              onChange={(value: string) =>
                setFilterValues({ ...filterValues, [filter.key]: value })
              }
              className="border-2 focus:border-primary"
              placeholder={`All ${filter.label}`}
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="shadow-sm hover:shadow-md">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.header}</TableHead>
              ))}
              {actions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
                    </TableCell>
                  ))}
                  {actions && <TableCell>{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

