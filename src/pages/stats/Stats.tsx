import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { PageHeader } from '../../components/common/PageHeader'
import { TrendingUp, Target, Zap, Award, Trophy } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { Select } from '../../components/ui/select'
import { useStats, useStatsLeaderboards } from '../../hooks/useStats'
import type { BallType } from '../../services/dashboardApi'

const BALL_TYPES: BallType[] = ['leather', 'tennis', 'other']

export function Stats() {
  const [ballType, setBallType] = useState<BallType>('leather')
  const { statsData, isLoading } = useStats({ ballType })
  const { leaderboards, isLoading: isLoadingLeaders } = useStatsLeaderboards({
    ballType,
    runScorers: 10,
    wicketTakers: 10,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Statistics"
          description="Comprehensive statistics and analytics"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!statsData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Statistics"
          description="Comprehensive statistics and analytics"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No statistics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistics"
        description="Comprehensive statistics and analytics"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Ball type</span>
        <Select
          value={ballType}
          onChange={(value: string | React.ChangeEvent<HTMLSelectElement>) => {
            const next =
              typeof value === 'string'
                ? value
                : value?.target?.value || 'leather'
            setBallType(next as BallType)
          }}
          className="w-48 border-2 focus:border-primary"
        >
          {BALL_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt.charAt(0).toUpperCase() + bt.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Completed Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsData.completedMatches.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {statsData.totalRuns.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" /> Total Wickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {statsData.totalWickets.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Total Fours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {statsData.totalFours.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" /> Total Sixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {statsData.totalSixes.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Run Scorers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLeaders ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : leaderboards?.runScorers?.length ? (
                  leaderboards.runScorers.map((player, idx) => {
                    const playerImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0E795D&color=fff&size=128`
                    return (
                      <TableRow key={player.playerId || player.name}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={playerImage} alt={player.name} />
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {player.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          {player.runs.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-500/5">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              Top Wicket Takers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Wickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLeaders ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : leaderboards?.wicketTakers?.length ? (
                  leaderboards.wicketTakers.map((player, idx) => {
                    const playerImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0E795D&color=fff&size=128`
                    return (
                      <TableRow key={player.playerId || player.name}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={playerImage} alt={player.name} />
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {player.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                          {player.wickets}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
