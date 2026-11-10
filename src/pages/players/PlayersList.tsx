import { useState, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { /* Trash2, */ ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/badge'
import { ConfirmDeleteDialog } from '../../components/common/ConfirmDeleteDialog'
import { useToast } from '../../components/ui/toast'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Download } from 'lucide-react'
import { exportTableToCSV } from '../../utils/csv'
import { usePlayers } from '../../hooks/usePlayers'
import { useCities } from '../../hooks/useCities'
import { playersApi } from '../../services/playersApi'
import type { Player } from '../../services/playersApi'

// Filter options use the values stored by the API (slugs, not display labels)
const BATTING_STYLES = [
  { value: 'left-hand', label: 'Left-hand bat' },
  { value: 'right-hand', label: 'Right-hand bat' },
]

const BOWLING_STYLES = [
  { value: 'right-arm-fast', label: 'Right-arm fast' },
  { value: 'right-arm-medium', label: 'Right-arm medium' },
  { value: 'left-arm-fast', label: 'Left-arm fast' },
  { value: 'left-arm-spin', label: 'Left-arm spin' },
]

const PLAYING_ROLES = [
  { value: 'batsman', label: 'Batsman' },
  { value: 'bowler', label: 'Bowler' },
  { value: 'all-rounder', label: 'All-rounder' },
  { value: 'wicket-keeper', label: 'Wicket-keeper' },
]

export function PlayersList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  // Filters (applied immediately on change)
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    battingStyle: '',
    bowlingStyle: '',
    role: '',
  })
  
  const [currentPage, setCurrentPage] = useState(1)

  // Changing a filter always goes back to the first page
  const updateFilters = (next: typeof filters) => {
    setFilters(next)
    setCurrentPage(1)
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const limit = 10


  // Prepare API params
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
    
    // Safely handle string trimming
    const nameValue = typeof filters.name === 'string' ? filters.name.trim() : String(filters.name || '').trim()
    if (nameValue) params.name = nameValue
    
    const cityValue = typeof filters.city === 'string' ? filters.city.trim() : String(filters.city || '').trim()
    if (cityValue) params.city = cityValue
    
    if (filters.battingStyle) params.battingStyle = filters.battingStyle
    if (filters.bowlingStyle) params.bowlingStyle = filters.bowlingStyle
    if (filters.role) params.role = filters.role
    
    return params
  }, [currentPage, limit, filters])

  // Fetch players data
  const { playersData, isLoading, refetch } = usePlayers(playersParams)

  const { cities } = useCities()

  // const handleDelete = (player: Player) => {
  //   setSelectedPlayer(player)
  //   setDeleteDialogOpen(true)
  // }

  const confirmDelete = async () => {
    if (!selectedPlayer) return

    try {
      await playersApi.deletePlayer(selectedPlayer.playerId)
      addToast({
        title: 'Success',
        description: 'Player deleted successfully',
        variant: 'success',
      })
      setSelectedPlayer(null)
      setDeleteDialogOpen(false)
      // Refetch data after delete
      refetch()
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete player',
        variant: 'destructive',
      })
    }
  }

  const handleResetFilters = () => {
    updateFilters({
      name: '',
      city: '',
      battingStyle: '',
      bowlingStyle: '',
      role: '',
    })
  }

  const handleExport = () => {
    if (!playersData?.results) return
    exportTableToCSV(playersData.results, 'players')
  }

  const players = playersData?.results || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="View and manage all players in the system"
      />

      {/* Filters Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50 space-y-4">
        {/* First Row: Name, City, Batting Style */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => updateFilters({ ...filters, name: e.target.value })}
            className="w-full sm:min-w-[250px] sm:max-w-[300px] border-2 focus:border-primary"
          />
          <Select
            value={filters.city}
            onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
              const value = typeof e === 'string' ? e : e.target.value
              updateFilters({ ...filters, city: value })
            }}
            className="flex-1 border-2 focus:border-primary"
            placeholder="All Cities"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.battingStyle}
            onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
              const value = typeof e === 'string' ? e : e.target.value
              updateFilters({ ...filters, battingStyle: value })
            }}
            className="flex-1 border-2 focus:border-primary"
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

        {/* Second Row: Bowling Style, Role, Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
            <Select
              value={filters.bowlingStyle}
              onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                const value = typeof e === 'string' ? e : e.target.value
                updateFilters({ ...filters, bowlingStyle: value })
              }}
              className="flex-1 border-2 focus:border-primary"
              placeholder="All Bowling Styles"
            >
              <option value="">All Bowling Styles</option>
              {BOWLING_STYLES.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.role}
              onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                const value = typeof e === 'string' ? e : e.target.value
                updateFilters({ ...filters, role: value })
              }}
              className="flex-1 border-2 focus:border-primary"
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
          <div className="flex items-center gap-2">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md"
            >
              Reset
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-muted-foreground">Loading players...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Batting</TableHead>
                  <TableHead>Bowling</TableHead>
                  <TableHead>WK</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Wickets</TableHead>
                  <TableHead>Strike Rate</TableHead>
                  <TableHead>Economy</TableHead>
                  <TableHead>Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center">
                      No players found.
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player) => (
                    <TableRow
                      key={player.playerId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/players/${player.playerId}`)}
                    >
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{player.city}</TableCell>
                      <TableCell>{player.playingRole}</TableCell>
                      <TableCell>{player.battingStyle || '-'}</TableCell>
                      <TableCell>{player.bowlingStyle || '-'}</TableCell>
                      <TableCell>
                        {player.isWicketKeeper ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{player.matches}</TableCell>
                      <TableCell>{player.runs}</TableCell>
                      <TableCell>{player.wickets}</TableCell>
                      <TableCell>{player.strikeRate.toFixed(2)}</TableCell>
                      <TableCell>
                        {player.economy > 0 ? player.economy.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        {player.average > 0 ? player.average.toFixed(2) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {playersData && playersData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
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
          </>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedPlayer?.name}
      />
    </div>
  )
}

