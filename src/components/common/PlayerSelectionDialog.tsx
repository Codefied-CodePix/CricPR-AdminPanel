import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

interface PlayerSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlayerIds: string[]
  onSelect: (playerIds: string[]) => void
}

// Filter options based on API requirements
const BATTING_STYLES = [
  { value: 'Left-hand bat', label: 'Left-hand bat' },
  { value: 'Right-hand bat', label: 'Right-hand bat' },
  { value: 'none', label: 'None' },
]

const BOWLING_STYLES = [
  { value: 'Right-arm fast', label: 'Right-arm fast' },
  { value: 'Right-arm medium', label: 'Right-arm medium' },
  { value: 'Left-arm fast', label: 'Left-arm fast' },
  { value: 'Left-arm medium', label: 'Left-arm medium' },
  { value: 'Slow left-arm orthodox', label: 'Slow left-arm orthodox' },
  { value: 'Slow left-arm chinaman', label: 'Slow left-arm chinaman' },
  { value: 'Right-arm Off Break', label: 'Right-arm Off Break' },
  { value: 'Right-arm Leg Break', label: 'Right-arm Leg Break' },
  { value: 'none', label: 'None' },
]

const PLAYING_ROLES = [
  { value: 'Top-order batter', label: 'Top-order batter' },
  { value: 'Middle-order batter', label: 'Middle-order batter' },
  { value: 'Wicket-keeper batter', label: 'Wicket-keeper batter' },
  { value: 'Wicket-keeper', label: 'Wicket-keeper' },
  { value: 'Bowler', label: 'Bowler' },
  { value: 'All-rounder', label: 'All-rounder' },
  { value: 'Lower-order batter', label: 'Lower-order batter' },
  { value: 'Opening batter', label: 'Opening batter' },
  { value: 'none', label: 'None' },
]

export function PlayerSelectionDialog({
  open,
  onOpenChange,
  selectedPlayerIds,
  onSelect,
}: PlayerSelectionDialogProps) {
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    battingStyle: '',
    bowlingStyle: '',
    role: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    city: '',
    battingStyle: '',
    bowlingStyle: '',
    role: '',
  })
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(
    new Set(selectedPlayerIds)
  )
  const limit = 20

  // Sync local selection with prop when dialog opens
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setLocalSelectedIds(new Set(selectedPlayerIds))
      setFilterDialogOpen(false)
    }
  }

  // Prepare API params based on applied filters
  const playersParams = useMemo(() => {
    const params: {
      page: number
      limit: number
      name?: string
      city?: string
      battingStyle?: string
      bowlingStyle?: string
      role?: string
    } = {
      page: currentPage,
      limit: limit,
    }

    const nameValue = typeof appliedFilters.name === 'string' ? appliedFilters.name.trim() : String(appliedFilters.name || '').trim()
    if (nameValue) params.name = nameValue

    const cityValue = typeof appliedFilters.city === 'string' ? appliedFilters.city.trim() : String(appliedFilters.city || '').trim()
    if (cityValue) params.city = cityValue

    if (appliedFilters.battingStyle) params.battingStyle = appliedFilters.battingStyle
    if (appliedFilters.bowlingStyle) params.bowlingStyle = appliedFilters.bowlingStyle
    if (appliedFilters.role) params.role = appliedFilters.role

    return params
  }, [currentPage, limit, appliedFilters])

  // Fetch players data
  const { playersData, isLoading } = usePlayers(playersParams)

  // Get unique cities from API response
  const cities = useMemo(() => {
    if (!playersData?.results) return []
    const uniqueCities = Array.from(
      new Set(playersData.results.map((player) => player.city).filter(Boolean))
    ).sort()
    return uniqueCities.map((city) => ({ value: city, label: city }))
  }, [playersData])

  const players = playersData?.results || []

  const handleTogglePlayer = (playerId: string) => {
    const newSelected = new Set(localSelectedIds)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      newSelected.add(playerId)
    }
    setLocalSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (players.every((p) => localSelectedIds.has(p.playerId))) {
      // Deselect all on current page
      const newSelected = new Set(localSelectedIds)
      players.forEach((p) => newSelected.delete(p.playerId))
      setLocalSelectedIds(newSelected)
    } else {
      // Select all on current page
      const newSelected = new Set(localSelectedIds)
      players.forEach((p) => newSelected.add(p.playerId))
      setLocalSelectedIds(newSelected)
    }
  }

  const handleConfirm = () => {
    onSelect(Array.from(localSelectedIds))
    onOpenChange(false)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
    setCurrentPage(1)
    setFilterDialogOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      name: '',
      city: '',
      battingStyle: '',
      bowlingStyle: '',
      role: '',
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setCurrentPage(1)
    setFilterDialogOpen(false)
  }

  const handleRemoveFilter = (filterKey: keyof typeof appliedFilters) => {
    const newFilters = { ...appliedFilters, [filterKey]: '' }
    setAppliedFilters(newFilters)
    setCurrentPage(1)
    setFilters(newFilters)
  }

  const allSelectedOnPage = players.length > 0 && players.every((p) => localSelectedIds.has(p.playerId))

  // Count active filters
  const activeFiltersCount = Object.values(appliedFilters).filter((v) => v !== '').length

  // Get filter label for display
  const getFilterLabel = (key: string, value: string) => {
    if (key === 'name') return `Name: ${value}`
    if (key === 'city') return `City: ${value}`
    if (key === 'battingStyle') {
      const option = BATTING_STYLES.find((o) => o.value === value)
      return `Batting: ${option?.label || value}`
    }
    if (key === 'bowlingStyle') {
      const option = BOWLING_STYLES.find((o) => o.value === value)
      return `Bowling: ${option?.label || value}`
    }
    if (key === 'role') {
      const option = PLAYING_ROLES.find((o) => o.value === value)
      return `Role: ${option?.label || value}`
    }
    return `${key}: ${value}`
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
          {/* Header with Filter Button Centered - Aligned with Close Button */}
          <div className="relative flex items-center justify-center h-16 px-6 border-b">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFilterDialogOpen(true)}
              className="relative shadow-sm hover:shadow-md group"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <span className="absolute left-full ml-2 px-2 py-1 bg-background border border-borderShadcn/50 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                Filters
              </span>
            </Button>

            {/* Active Filters - Below Filter Button */}
            {activeFiltersCount > 0 && (
              <div className="absolute top-full left-0 right-0 px-6 py-2 flex items-center gap-2 flex-wrap border-b bg-background z-10">
                {Object.entries(appliedFilters).map(([key, value]) => {
                  if (!value) return null
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {getFilterLabel(key, value)}
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(key as keyof typeof appliedFilters)}
                        className="ml-1 rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Scrollable Table Section */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden shadow-lg">
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <span className="text-muted-foreground">Loading players...</span>
                  </div>
                ) : (
                  <div className="relative overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                        <TableRow>
                          <TableHead className="w-[50px] bg-background sticky left-0 z-30 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                            <input
                              type="checkbox"
                              checked={allSelectedOnPage}
                              onChange={handleSelectAll}
                              className="cursor-pointer"
                            />
                          </TableHead>
                          <TableHead className="bg-background">Player Name</TableHead>
                          <TableHead className="bg-background">City</TableHead>
                          <TableHead className="bg-background">Role</TableHead>
                          <TableHead className="bg-background">Batting</TableHead>
                          <TableHead className="bg-background">Bowling</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No players found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          players.map((player) => (
                            <TableRow
                              key={player.playerId}
                              className={localSelectedIds.has(player.playerId) ? 'bg-muted/50' : ''}
                            >
                              <TableCell className="sticky left-0 bg-inherit z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                <input
                                  type="checkbox"
                                  checked={localSelectedIds.has(player.playerId)}
                                  onChange={() => handleTogglePlayer(player.playerId)}
                                  className="cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{player.name}</TableCell>
                              <TableCell>{player.city}</TableCell>
                              <TableCell>{player.playingRole}</TableCell>
                              <TableCell>{player.battingStyle || '-'}</TableCell>
                              <TableCell>{player.bowlingStyle || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Pagination */}
            {playersData && playersData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t bg-background">
                <div className="text-sm text-muted-foreground">
                  Showing page {playersData.page} of {playersData.totalPages} (
                  {playersData.totalResults} total results)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, playersData.totalPages) },
                      (_, i) => {
                        let pageNum
                        if (playersData.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= playersData.totalPages - 2) {
                          pageNum = playersData.totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        )
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(playersData.totalPages, prev + 1))
                    }
                    disabled={currentPage === playersData.totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Selection ({localSelectedIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filter Players</DialogTitle>
            <DialogDescription>
              Apply filters to find specific players
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Player Name</label>
              <Input
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select
                value={filters.city}
                onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value
                  setFilters({ ...filters, city: value })
                }}
                className="border-2 focus:border-primary"
                placeholder="All Cities"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Batting Style</label>
              <Select
                value={filters.battingStyle}
                onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value
                  setFilters({ ...filters, battingStyle: value })
                }}
                className="border-2 focus:border-primary"
                placeholder="All Batting Styles"
              >
                <option value="">All Batting Styles</option>
                {BATTING_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bowling Style</label>
              <Select
                value={filters.bowlingStyle}
                onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value
                  setFilters({ ...filters, bowlingStyle: value })
                }}
                className="border-2 focus:border-primary"
                placeholder="All Bowling Styles"
              >
                <option value="">All Bowling Styles</option>
                {BOWLING_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Playing Role</label>
              <Select
                value={filters.role}
                onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value
                  setFilters({ ...filters, role: value })
                }}
                className="border-2 focus:border-primary"
                placeholder="All Roles"
              >
                <option value="">All Roles</option>
                {PLAYING_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
