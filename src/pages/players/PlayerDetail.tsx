import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Target, TrendingUp, Activity, MapPin, Mail, Phone, Award, Calendar, Zap } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { PlayerAvatar } from '../../components/common/PlayerAvatar'
import { usePlayer } from '../../hooks/usePlayer'
import { format } from 'date-fns'

export function PlayerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playerData, isLoading, isError } = usePlayer(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading player details...</p>
      </div>
    )
  }

  if (isError || !playerData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Player not found</p>
        <Button onClick={() => navigate('/players')} className="mt-4">
          Back to Players
        </Button>
      </div>
    )
  }

  const player = playerData

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/players')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Players
      </Button>

      {/* Header Section with Profile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-dark p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2SDI0VjM0aDEyem0wLTI0djI2SDI0VjEwaDEyem0yNCAwaC0xMnYyNmgxMlYxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <PlayerAvatar
              className="h-32 w-32 border-4 border-white/30 shadow-xl ring-4 ring-white/20"
              src={player.profileImage}
              name={player.name}
              fallbackClassName="bg-white/20 text-white text-3xl backdrop-blur-sm"
            />
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                {player.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {player.teams && player.teams.length > 0 && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {player.teams[0]}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm capitalize">
                  {player.playingRole}
                </Badge>
                {player.city && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{player.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-primary">{player.matches}</div>
            <p className="text-xs text-muted-foreground mt-1">Career matches</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{player.runs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total career runs</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Wickets</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{player.wickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Career wickets</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Strike Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{player.strikeRate.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Batting strike rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Information Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Player Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-semibold capitalize">{player.playingRole}</p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {player.playingRole}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teams</p>
                    <p className="font-semibold">{player.teams?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {player.city && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="font-semibold">{player.city}</p>
                    </div>
                  </div>
                </div>
              )}
              {player.battingStyle && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Trophy className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Batting Style</p>
                      <p className="font-semibold">{player.battingStyle}</p>
                    </div>
                  </div>
                </div>
              )}
              {player.bowlingStyle && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Target className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bowling Style</p>
                      <p className="font-semibold">{player.bowlingStyle}</p>
                    </div>
                  </div>
                </div>
              )}
              {player.country && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <MapPin className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="font-semibold">{player.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {player.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{player.email}</p>
                </div>
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Phone className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{player.phone}</p>
                </div>
              </div>
            )}
            {player.economy > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Economy Rate</p>
                    <p className="text-2xl font-bold text-primary">{player.economy.toFixed(2)}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary/30" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Activity className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="performances" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="mr-2 h-4 w-4" />
            Top Performances
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Career Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Matches
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-primary">{player.matches}</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Runs
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {player.runs.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-500" />
                        Wickets
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">{player.wickets}</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Strike Rate
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {player.strikeRate.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        Average
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {player.average.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                  {player.economy > 0 && (
                    <TableRow className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-500" />
                          Economy
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {player.economy.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="matches" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Match</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">Runs</TableHead>
                      <TableHead className="font-semibold text-right">Wickets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.matchesArray && player.matchesArray.length > 0 ? (
                      player.matchesArray.map((match, index) => (
                        <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">
                            {match.matchTitle}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {match.startDate && !isNaN(new Date(match.startDate).getTime()) 
                                ? format(new Date(match.startDate), 'MMM dd, yyyy')
                                : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {match.runs}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {match.wickets}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No matches found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2 border-borderShadcn/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Highest Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">{player.highestScore}*</p>
                <p className="text-xs text-muted-foreground mt-2">Best batting performance</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-borderShadcn/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Bowling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400">{player.bestBowling}</p>
                <p className="text-xs text-muted-foreground mt-2">Best bowling figures</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-borderShadcn/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{player.average.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">Batting average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

