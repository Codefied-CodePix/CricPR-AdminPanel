import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/badge'
import { ConfirmDeleteDialog } from '../../components/common/ConfirmDeleteDialog'
import { useToast } from '../../components/ui/toast'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Download } from 'lucide-react'
import { exportTableToCSV } from '../../utils/csv'
import { useTournaments } from '../../hooks/useTournaments'
import { tournamentsApi } from '../../services/tournamentsApi'
import type { Tournament } from '../../services/tournamentsApi'
import { format } from 'date-fns'

// Sort options
const SORT_OPTIONS = [
  { value: 'totalMatches', label: 'Total Matches' },
  { value: 'totalTeams', label: 'Total Teams' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
]

export function TournamentsList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  // Filters (applied immediately on change)
  const [filters, setFilters] = useState({
    sortBy: '',
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 10

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Prepare API params
  const tournamentsParams = useMemo(() => {
    const params: {
      page: number
      limit: number
      sortBy?: string
    } = {
      page: currentPage,
      limit: limit,
    }
    
    if (filters.sortBy) params.sortBy = filters.sortBy
    
    return params
  }, [currentPage, limit, filters])

  // Fetch tournaments data
  const { tournamentsData, isLoading, refetch } = useTournaments(tournamentsParams)

  const handleDelete = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTournament || isDeleting) return

    setIsDeleting(true)
    try {
      await tournamentsApi.deleteTournament(selectedTournament.tournamentId)
      addToast({
        title: 'Success',
        description: 'Tournament deleted successfully',
        variant: 'success',
      })
      setSelectedTournament(null)
      setDeleteDialogOpen(false)
      refetch()
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete tournament',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      sortBy: '',
    })
  }

  const handleExport = () => {
    if (!tournamentsData?.results) return
    exportTableToCSV(tournamentsData.results, 'tournaments')
  }

  const tournaments = tournamentsData?.results || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        description="View and manage all tournaments in the system"
      />

      {/* Filters Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            value={filters.sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
              const value = typeof e === 'string' ? e : e.target.value
              setFilters({ ...filters, sortBy: value })
            }}
            className="w-full border-2 focus:border-primary"
            placeholder="Sort By"
          >
            <option value="">No Sorting</option>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="flex-1 shadow-sm hover:shadow-md"
            >
              Reset
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex-1 shadow-sm hover:shadow-md"
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
            <span className="text-muted-foreground">Loading tournaments...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Total Matches</TableHead>
                  <TableHead>Total Teams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No tournaments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tournaments.map((tournament) => (
                    <TableRow key={tournament.tournamentId}>
                      <TableCell className="font-medium">{tournament.name}</TableCell>
                      <TableCell>
                        {format(new Date(tournament.startDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(tournament.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{tournament.totalMatches}</TableCell>
                      <TableCell>{tournament.totalTeams}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tournament.status === 'Completed'
                              ? 'success'
                              : tournament.status === 'Upcoming'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {tournament.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/tournaments/${tournament.tournamentId}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tournament)}
                            disabled={isDeleting}
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
            {tournamentsData && tournamentsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
                <div className="text-sm text-muted-foreground">
                  Showing page {tournamentsData.page} of {tournamentsData.totalPages} (
                  {tournamentsData.totalResults} total results)
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
                      { length: Math.min(5, tournamentsData.totalPages) },
                      (_, i) => {
                        let pageNum
                        if (tournamentsData.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= tournamentsData.totalPages - 2) {
                          pageNum = tournamentsData.totalPages - 4 + i
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
                      setCurrentPage((prev) => Math.min(tournamentsData.totalPages, prev + 1))
                    }
                    disabled={currentPage === tournamentsData.totalPages || isLoading}
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
        itemName={selectedTournament?.name}
        isLoading={isDeleting}
      />
    </div>
  )
}

