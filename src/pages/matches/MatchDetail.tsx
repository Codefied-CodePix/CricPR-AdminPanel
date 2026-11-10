import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Trophy, Activity, Target } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { useMatch } from '../../hooks/useMatch'
import { format } from 'date-fns'

export function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matchData, isLoading, isError } = useMatch(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading match details...</p>
      </div>
    )
  }

  if (isError || !matchData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Match not found</p>
        <Button onClick={() => navigate('/matches')} className="mt-4">
          Back to Matches
        </Button>
      </div>
    )
  }

  const match = matchData
  const teamA = match.teamAName
  const teamB = match.teamBName
  const teamALogoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamA)}&background=0E795D&color=fff&size=128`
  const teamBLogoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamB)}&background=01411C&color=fff&size=128`
  const teamALogo = match.teamALogo || teamALogoFallback
  const teamBLogo = match.teamBLogo || teamBLogoFallback

  // Get team data from scorecard - match by team name to ensure correct order
  // Add fallback values in case scorecard or teams are undefined
  const scorecardTeams = match.scorecard?.teams || []
  const teamAData = scorecardTeams.find(t => t.teamName === teamA) || scorecardTeams[0] || {
    teamName: teamA,
    battingStats: [],
    bowlingStats: []
  }
  const teamBData = scorecardTeams.find(t => t.teamName === teamB) || scorecardTeams[1] || scorecardTeams[0] || {
    teamName: teamB,
    battingStats: [],
    bowlingStats: []
  }
  
  // Get team scores from summary - match by team name
  // Add fallback values in case summary or teamScores are undefined
  const summaryTeamScores = match.summary?.teamScores || []
  const teamAScoreData = summaryTeamScores.find(t => t.teamName === teamA) || summaryTeamScores[0] || {
    teamName: teamA,
    score: 0,
    wickets: 0,
    overs: '0.0'
  }
  const teamBScoreData = summaryTeamScores.find(t => t.teamName === teamB) || summaryTeamScores[1] || summaryTeamScores[0] || {
    teamName: teamB,
    score: 0,
    wickets: 0,
    overs: '0.0'
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/matches')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Matches
      </Button>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-dark p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2SDI0VjM0aDEyem0wLTI0djI2SDI0VjEwaDEyem0yNCAwaC0xMnYyNmgxMlYxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative">
          <div className="flex flex-col items-center gap-6 pt-8">
            <div className="text-center space-y-2">
              {match.tournamentName && (
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2">
                  {match.tournamentName}
                </Badge>
              )}
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                {match.matchTitle}
              </h1>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl ring-4 ring-white/20">
                  <AvatarImage src={teamALogo} alt={teamA} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl backdrop-blur-sm">
                    {teamA
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-lg">{teamA}</span>
              </div>
              <div className="text-white text-2xl font-bold">VS</div>
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl ring-4 ring-white/20">
                  <AvatarImage src={teamBLogo} alt={teamB} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl backdrop-blur-sm">
                    {teamB
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-lg">{teamB}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <Badge
                variant={
                  match.status === 'completed'
                    ? 'success'
                    : match.status === 'live'
                    ? 'destructive'
                    : 'secondary'
                }
                className="bg-white/20 border-white/30 backdrop-blur-sm"
              >
                {match.status}
              </Badge>
              {match.result && (
                <span className="text-sm font-medium">{match.result}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match Information and Scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {match.startDate ? format(new Date(match.startDate), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-semibold">{match.startTime || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MapPin className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold">{match.location || 'N/A'}</p>
                </div>
              </div>
            </div>
            {match.ground && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <MapPin className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ground</p>
                    <p className="font-semibold">{match.ground}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{match.status}</p>
                </div>
              </div>
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
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={teamALogo} alt={teamA} />
                <AvatarFallback className="bg-primary text-white text-xs">
                  {teamA
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm font-medium">{teamA}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary">
                {teamAScoreData.score}/{teamAScoreData.wickets}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teamAScoreData.overs} overs
              </p>
            </div>
            <div className="space-y-3 pt-3 border-t border-borderShadcn/30">
              {(() => {
                const topBatsman = [...teamAData.battingStats]
                  .filter(p => p.hasBat)
                  .sort((a, b) => b.runs - a.runs)[0]
                return topBatsman ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Top Batsman</p>
                        <p className="text-sm font-semibold">{topBatsman.playerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {topBatsman.runs}{topBatsman.isNotOut ? '*' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">Runs</p>
                    </div>
                  </div>
                ) : null
              })()}
              {(() => {
                const topBowler = [...teamBData.bowlingStats]
                  .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0]
                return topBowler ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Top Bowler</p>
                        <p className="text-sm font-semibold">{topBowler.playerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {topBowler.wickets}/{topBowler.runs}
                      </p>
                      <p className="text-xs text-muted-foreground">Wickets</p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={teamBLogo} alt={teamB} />
                <AvatarFallback className="bg-primary-dark text-white text-xs">
                  {teamB
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm font-medium">{teamB}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary-dark">
                {teamBScoreData.score}/{teamBScoreData.wickets}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teamBScoreData.overs} overs
              </p>
            </div>
            <div className="space-y-3 pt-3 border-t border-borderShadcn/30">
              {(() => {
                const topBatsman = [...teamBData.battingStats]
                  .filter(p => p.hasBat)
                  .sort((a, b) => b.runs - a.runs)[0]
                return topBatsman ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Top Batsman</p>
                        <p className="text-sm font-semibold">{topBatsman.playerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {topBatsman.runs}{topBatsman.isNotOut ? '*' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">Runs</p>
                    </div>
                  </div>
                ) : null
              })()}
              {(() => {
                const topBowler = [...teamAData.bowlingStats]
                  .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0]
                return topBowler ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Top Bowler</p>
                        <p className="text-sm font-semibold">{topBowler.playerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {topBowler.wickets}/{topBowler.runs}
                      </p>
                      <p className="text-xs text-muted-foreground">Wickets</p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scorecard */}
      <Card className="border-2 border-borderShadcn/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Match Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Team A Batting */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={teamALogo} alt={teamA} />
                <AvatarFallback className="bg-primary text-white text-xs">
                  {teamA
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{teamA} - Batting</h3>
            </div>
            <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold text-right">Runs</TableHead>
                    <TableHead className="font-semibold text-right">Balls</TableHead>
                    <TableHead className="font-semibold text-right">4s</TableHead>
                    <TableHead className="font-semibold text-right">6s</TableHead>
                    <TableHead className="font-semibold text-right">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamAData.battingStats.length > 0 ? (
                    teamAData.battingStats.map((player, index) => (
                      <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">
                          {player.playerName}
                          {player.isNotOut && player.hasBat && <span className="text-green-600 ml-1">*</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">{player.runs}</span>
                        </TableCell>
                        <TableCell className="text-right">{player.balls}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-blue-600 dark:text-blue-400">{player.fours}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-purple-600 dark:text-purple-400">{player.sixes}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {player.strikeRate.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No batting data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Team B Bowling */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={teamBLogo} alt={teamB} />
                <AvatarFallback className="bg-primary-dark text-white text-xs">
                  {teamB
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{teamB} - Bowling</h3>
            </div>
            <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold text-right">Overs</TableHead>
                    <TableHead className="font-semibold text-right">Runs</TableHead>
                    <TableHead className="font-semibold text-right">Wickets</TableHead>
                    <TableHead className="font-semibold text-right">Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* bowlingStats of an innings are the opposition's bowlers, so team B's bowlers sit on team A's innings */}
                  {teamAData.bowlingStats.length > 0 ? (
                    teamAData.bowlingStats.map((player, index) => (
                      <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">{player.playerName}</TableCell>
                        <TableCell className="text-right">{player.overs}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 dark:text-red-400">{player.runs}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">{player.wickets}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {player.economy.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No bowling data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Team B Batting */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={teamBLogo} alt={teamB} />
                <AvatarFallback className="bg-primary-dark text-white text-xs">
                  {teamB
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{teamB} - Batting</h3>
            </div>
            <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold text-right">Runs</TableHead>
                    <TableHead className="font-semibold text-right">Balls</TableHead>
                    <TableHead className="font-semibold text-right">4s</TableHead>
                    <TableHead className="font-semibold text-right">6s</TableHead>
                    <TableHead className="font-semibold text-right">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamBData.battingStats.length > 0 ? (
                    teamBData.battingStats.map((player, index) => (
                      <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">
                          {player.playerName}
                          {player.isNotOut && player.hasBat && <span className="text-green-600 ml-1">*</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">{player.runs}</span>
                        </TableCell>
                        <TableCell className="text-right">{player.balls}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-blue-600 dark:text-blue-400">{player.fours}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-purple-600 dark:text-purple-400">{player.sixes}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {player.strikeRate.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No batting data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Team A Bowling */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={teamALogo} alt={teamA} />
                <AvatarFallback className="bg-primary text-white text-xs">
                  {teamA
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{teamA} - Bowling</h3>
            </div>
            <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold text-right">Overs</TableHead>
                    <TableHead className="font-semibold text-right">Runs</TableHead>
                    <TableHead className="font-semibold text-right">Wickets</TableHead>
                    <TableHead className="font-semibold text-right">Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamBData.bowlingStats.length > 0 ? (
                    teamBData.bowlingStats.map((player, index) => (
                      <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">{player.playerName}</TableCell>
                        <TableCell className="text-right">{player.overs}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 dark:text-red-400">{player.runs}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">{player.wickets}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {player.economy.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No bowling data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

