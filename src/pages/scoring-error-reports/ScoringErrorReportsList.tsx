import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { useScoringErrorReports } from '../../hooks/useScoringErrorReports'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function ScoringErrorReportsList() {
  const navigate = useNavigate()
  const [matchIdInput, setMatchIdInput] = useState('')
  const [matchIdFilter, setMatchIdFilter] = useState('')
  const [matchIdError, setMatchIdError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [matchIdFilter])

  const params = useMemo(
    () => ({
      page: currentPage,
      limit,
      ...(matchIdFilter ? { matchId: matchIdFilter } : {}),
    }),
    [currentPage, matchIdFilter]
  )

  const { reportsData, isLoading, isError, error } = useScoringErrorReports(params)
  const reports = reportsData?.results || []

  const applyMatchFilter = () => {
    const value = matchIdInput.trim()
    if (!value) {
      setMatchIdError('')
      setMatchIdFilter('')
      return
    }
    if (!UUID_RE.test(value)) {
      setMatchIdError('Match ID must be a valid UUID')
      return
    }
    setMatchIdError('')
    setMatchIdFilter(value)
  }

  const resetFilters = () => {
    setMatchIdInput('')
    setMatchIdFilter('')
    setMatchIdError('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scoring Error Reports"
        description="Scorer CONFLICT / sync error reports submitted from the player app"
      />

      <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Filter by Match ID
            </label>
            <Input
              placeholder="UUID (optional)"
              value={matchIdInput}
              onChange={(e) => setMatchIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyMatchFilter()
              }}
              className="border-2 focus:border-primary"
            />
            {matchIdError && (
              <p className="text-sm text-destructive">{matchIdError}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyMatchFilter}>Apply</Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="text-muted-foreground">Loading reports...</span>
          </div>
        ) : isError ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <p>{error instanceof Error ? error.message : 'Failed to load reports'}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Scorer</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No scoring error reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-primary/5"
                      onClick={() =>
                        navigate(`/scoring-error-reports/${report.id}`)
                      }
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(report.createdAt), 'hh:mm a')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 max-w-[220px]">
                          <span className="font-medium truncate">
                            {report.match?.title ||
                              report.match?.teamsLabel ||
                              'Unknown match'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {report.matchId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.reportedBy?.name ||
                          report.reportedBy?.email ||
                          report.reportedByUserId ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        {report.match?.scorer?.name ||
                          report.match?.scorer?.id ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        {report.tournament?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={report.emailSent ? 'success' : 'secondary'}
                        >
                          {report.emailSent ? 'Sent' : 'Not sent'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/scoring-error-reports/${report.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {reportsData && reportsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
                <div className="text-sm text-muted-foreground">
                  Showing page {reportsData.page} of {reportsData.totalPages} (
                  {reportsData.totalResults} total results)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(reportsData.totalPages, p + 1)
                      )
                    }
                    disabled={
                      currentPage === reportsData.totalPages || isLoading
                    }
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
    </div>
  )
}
