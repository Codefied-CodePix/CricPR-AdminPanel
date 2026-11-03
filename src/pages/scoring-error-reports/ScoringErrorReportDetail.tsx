import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Trophy,
  User,
} from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useScoringErrorReport } from '../../hooks/useScoringErrorReports'

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-borderShadcn/40 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium break-all">{value ?? '—'}</span>
    </div>
  )
}

export function ScoringErrorReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { report, isLoading, isError, error } = useScoringErrorReport(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Scoring Error Report" description="Loading details..." />
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Loading report...
        </div>
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="space-y-6">
        <PageHeader title="Scoring Error Report" description="Report details" />
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <p>
              {error instanceof Error
                ? error.message
                : 'Scoring error report not found'}
            </p>
            <Button variant="outline" onClick={() => navigate('/scoring-error-reports')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to reports
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const errorJson = (() => {
    try {
      return JSON.stringify(report.errorData ?? null, null, 2)
    } catch {
      return String(report.errorData)
    }
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Scoring Error Report"
          description={`Report ${report.id}`}
        />
        <Button
          variant="outline"
          onClick={() => navigate('/scoring-error-reports')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              label="Created"
              value={format(new Date(report.createdAt), 'PPpp')}
            />
            <DetailRow label="Report ID" value={report.id} />
            <DetailRow label="Match ID" value={report.matchId} />
            <DetailRow label="Client IP" value={report.clientIp || '—'} />
            <DetailRow label="User Agent" value={report.userAgent || '—'} />
            <DetailRow
              label="Email status"
              value={
                <Badge variant={report.emailSent ? 'success' : 'secondary'}>
                  {report.emailSent ? 'Sent' : 'Not sent'}
                </Badge>
              }
            />
            {report.emailSentAt && (
              <DetailRow
                label="Email sent at"
                value={format(new Date(report.emailSentAt), 'PPpp')}
              />
            )}
            {report.emailError && (
              <DetailRow label="Email error" value={report.emailError} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              label="Reporter"
              value={
                report.reportedBy
                  ? `${report.reportedBy.name || '—'} (${report.reportedBy.id})`
                  : report.reportedByUserId || '—'
              }
            />
            <DetailRow
              label="Reporter email"
              value={report.reportedBy?.email || '—'}
            />
            <DetailRow
              label="Reporter phone"
              value={report.reportedBy?.phone || '—'}
            />
            <DetailRow
              label="Match scorer"
              value={
                report.match?.scorer
                  ? `${report.match.scorer.name || '—'} (${report.match.scorer.id})`
                  : '—'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Match & Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              label="Match title"
              value={report.match?.title || '—'}
            />
            <DetailRow
              label="Teams"
              value={report.match?.teamsLabel || '—'}
            />
            <DetailRow
              label="Status"
              value={report.match?.status || '—'}
            />
            <DetailRow
              label="Venue"
              value={
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {report.match?.venue || '—'}
                </span>
              }
            />
            <DetailRow
              label="Tournament"
              value={report.tournament?.name || '—'}
            />
            <DetailRow
              label="Organizer"
              value={
                report.tournament?.organizer
                  ? `${report.tournament.organizer.name || '—'}${
                      report.tournament.organizer.id
                        ? ` (${report.tournament.organizer.id})`
                        : ''
                    }`
                  : '—'
              }
            />
            {report.matchId && (
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/matches/${report.matchId}`)}
                >
                  Open match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Error payload (`errorData`)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[480px] overflow-auto rounded-lg bg-muted/50 border border-borderShadcn/50 p-4 text-xs leading-relaxed">
            {errorJson}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
