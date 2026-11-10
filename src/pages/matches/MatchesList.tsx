import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChangeEvent } from 'react'
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
import { useMatches } from '../../hooks/useMatches'
import { matchesApi } from '../../services/matchesApi'
import type { Match } from '../../services/matchesApi'
import { format } from 'date-fns'

// Status options
const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'abandoned', label: 'Abandoned' },
]

export function MatchesList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  // Filters (applied immediately on change)
  const [filters, setFilters] = useState({
    team_name: '',
    status: '',
  })
  
  const [currentPage, setCurrentPage] = useState(1)

  // Changing a filter always goes back to the first page
  const updateFilters = (next: typeof filters) => {
    setFilters(next)
    setCurrentPage(1)
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const limit = 10


  // Prepare API params
  const matchesParams = useMemo(() => {
    const params: {
      page: number
      limit: number
      team_name?: string
      status?: string
    } = {
      page: currentPage,
      limit: limit,
    }
    
    // Safely handle string trimming
    const teamNameValue = typeof filters.team_name === 'string' ? filters.team_name.trim() : String(filters.team_name || '').trim()
    if (teamNameValue) params.team_name = teamNameValue
    
    if (filters.status) params.status = filters.status
    
    return params
  }, [currentPage, limit, filters])

  // Fetch matches data
  const { matchesData, isLoading, refetch } = useMatches(matchesParams)

  const handleDelete = (match: Match) => {
    setSelectedMatch(match)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMatch) return

    try {
      await matchesApi.deleteMatch(selectedMatch.id)
      addToast({
        title: 'Success',
        description: 'Match deleted successfully',
        variant: 'success',
      })
      setSelectedMatch(null)
      setDeleteDialogOpen(false)
      // Refetch data after delete
      refetch()
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete match',
        variant: 'destructive',
      })
    }
  }

  const handleResetFilters = () => {
    updateFilters({
      team_name: '',
      status: '',
    })
  }

  const handleExport = () => {
    if (!matchesData?.results) return
    exportTableToCSV(matchesData.results, 'matches')
  }

  const matches = matchesData?.results || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matches"
        description="View and manage all matches in the system"
      />

      {/* Filters Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Search by team name..."
            value={filters.team_name}
            onChange={(e) => updateFilters({ ...filters, team_name: e.target.value })}
            className="w-full border-2 focus:border-primary"
          />
          <Select
            value={filters.status}
            onChange={(e: ChangeEvent<HTMLSelectElement> | string) => {
              const value = typeof e === 'string' ? e : e.target.value
              updateFilters({ ...filters, status: value })
            }}
            className="w-full border-2 focus:border-primary"
            placeholder="All Statuses"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
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
            <span className="text-muted-foreground">Loading matches...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Tournament/Match Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No matches found.
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((match) => (
                    <TableRow
                      key={match.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/matches/${match.id}`)}
                    >
                      <TableCell className="font-medium">{match.title}</TableCell>
                      <TableCell>
                        {match.tournamentName || match.matchType}
                      </TableCell>
                      <TableCell>
                        {match.date ? format(new Date(match.date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>{match.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            match.status === 'completed'
                              ? 'success'
                              : match.status === 'live'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {match.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{match.result || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(match)
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
            {matchesData && matchesData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
                <div className="text-sm text-muted-foreground">
                  Showing page {matchesData.page} of {matchesData.totalPages} (
                  {matchesData.totalResults} total results)
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
                      { length: Math.min(5, matchesData.totalPages) },
                      (_, i) => {
                        let pageNum
                        if (matchesData.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= matchesData.totalPages - 2) {
                          pageNum = matchesData.totalPages - 4 + i
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
                      setCurrentPage((prev) => Math.min(matchesData.totalPages, prev + 1))
                    }
                    disabled={currentPage === matchesData.totalPages || isLoading}
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
        itemName={selectedMatch?.title}
      />
    </div>
  )
}

