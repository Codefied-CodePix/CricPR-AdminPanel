import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/common/PageHeader'
import { ConfirmDeleteDialog } from '../../components/common/ConfirmDeleteDialog'
import { useToast } from '../../components/ui/toast'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Download } from 'lucide-react'
import { exportTableToCSV } from '../../utils/csv'
import { useTeams } from '../../hooks/useTeams'
import { useCities } from '../../hooks/useCities'
import { teamsApi } from '../../services/teamsApi'
import type { Team } from '../../services/teamsApi'

// Sort options
const SORT_OPTIONS = [
  { value: 'wins', label: 'Wins' },
  { value: 'losses', label: 'Losses' },
  { value: 'matches', label: 'Matches' },
  { value: 'totalRuns', label: 'Total Runs' },
  { value: 'totalWickets', label: 'Total Wickets' },
]

export function TeamsList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  // Filters (applied immediately on change)
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    sortBy: '',
  })
  
  const [currentPage, setCurrentPage] = useState(1)

  // Changing a filter always goes back to the first page
  const updateFilters = (next: typeof filters) => {
    setFilters(next)
    setCurrentPage(1)
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const limit = 10


  // Prepare API params
  const teamsParams = useMemo(() => {
    const params: {
      page: number
      limit: number
      name?: string
      city?: string
      sortBy?: string
    } = {
      page: currentPage,
      limit: limit,
    }
    
    // Safely handle string trimming
    const nameValue = typeof filters.name === 'string' ? filters.name.trim() : String(filters.name || '').trim()
    if (nameValue) params.name = nameValue
    
    const cityValue = typeof filters.city === 'string' ? filters.city.trim() : String(filters.city || '').trim()
    if (cityValue) params.city = cityValue
    
    if (filters.sortBy) params.sortBy = filters.sortBy
    
    return params
  }, [currentPage, limit, filters])

  // Fetch teams data
  const { teamsData, isLoading, refetch } = useTeams(teamsParams)

  const { cities } = useCities()

  const handleDelete = (team: Team) => {
    setSelectedTeam(team)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTeam) return

    try {
      await teamsApi.deleteTeam(selectedTeam.teamId)
      addToast({
        title: 'Success',
        description: 'Team deleted successfully',
        variant: 'success',
      })
      setSelectedTeam(null)
      setDeleteDialogOpen(false)
      // Refetch data after delete
      refetch()
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete team',
        variant: 'destructive',
      })
    }
  }

  const handleResetFilters = () => {
    updateFilters({
      name: '',
      city: '',
      sortBy: '',
    })
  }

  const handleExport = () => {
    if (!teamsData?.results) return
    exportTableToCSV(teamsData.results, 'teams')
  }

  const teams = teamsData?.results || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="View and manage all teams in the system"
      />

      {/* Filters Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50 space-y-4">
        {/* First Row: Name, City */}
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
        </div>

        {/* Second Row: Sort By, Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
            <Select
              value={filters.sortBy}
              onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
                const value = typeof e === 'string' ? e : e.target.value
                updateFilters({ ...filters, sortBy: value })
              }}
              className="flex-1 border-2 focus:border-primary"
              placeholder="Sort By"
            >
              <option value="">No Sorting</option>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
            <span className="text-muted-foreground">Loading teams...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Captain</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead>Total Runs</TableHead>
                  <TableHead>Total Wickets</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No teams found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow
                      key={team.teamId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/teams/${team.teamId}`)}
                    >
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>{team.captainName}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell>{team.matches}</TableCell>
                      <TableCell>{team.wins}</TableCell>
                      <TableCell>{team.losses}</TableCell>
                      <TableCell>{team.totalRuns}</TableCell>
                      <TableCell>{team.totalWickets}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(team)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {teamsData && teamsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
                <div className="text-sm text-muted-foreground">
                  Showing page {teamsData.page} of {teamsData.totalPages} (
                  {teamsData.totalResults} total results)
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
                      { length: Math.min(5, teamsData.totalPages) },
                      (_, i) => {
                        let pageNum
                        if (teamsData.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= teamsData.totalPages - 2) {
                          pageNum = teamsData.totalPages - 4 + i
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
                      setCurrentPage((prev) => Math.min(teamsData.totalPages, prev + 1))
                    }
                    disabled={currentPage === teamsData.totalPages || isLoading}
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
        itemName={selectedTeam?.teamName}
      />
    </div>
  )
}

