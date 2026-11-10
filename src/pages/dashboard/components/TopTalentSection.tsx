import { useState, useMemo } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Select } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useTopTalent } from "../../../hooks/useDashboard";
import { ROLE_MAPPING } from "../constants";
import type { TopTalentPlayer } from "../../../services/dashboardApi";

interface TopTalentSectionProps {
  initialSkillFilter?: string;
}

export function TopTalentSection({ initialSkillFilter = "batsman" }: TopTalentSectionProps) {
  const navigate = useNavigate();
  const [cityFilter, setCityFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState(initialSkillFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allPlayers, setAllPlayers] = useState<TopTalentPlayer[]>([]);

  // Map skill filter to API role format
  const apiRole = useMemo(() => {
    return ROLE_MAPPING[skillFilter] || "Batsmen";
  }, [skillFilter]);

  // Prepare API params
  const topTalentParams = useMemo(() => {
    const params: { role: string; city?: string; page: number; limit: number } = {
      role: apiRole,
      page: currentPage,
      limit: 10,
    };
    // Ensure cityFilter is a string and not empty
    const cityValue = typeof cityFilter === 'string' ? cityFilter.trim() : String(cityFilter || '').trim();
    if (cityValue !== '') {
      params.city = cityValue;
    }
    return params;
  }, [apiRole, cityFilter, currentPage]);

  // Fetch top talent data
  const { topTalentData, isLoading: isLoadingTopTalent } = useTopTalent(topTalentParams);

  // Reset accumulated data when role changes (not when city filter changes)
  // This ensures cities remain available even when a city filter is applied
  const [prevRole, setPrevRole] = useState(apiRole);
  const [accumulatedResults, setAccumulatedResults] = useState<TopTalentPlayer[] | null>(null);
  if (prevRole !== apiRole) {
    setPrevRole(apiRole);
    setAllPlayers([]);
    setAllCities([]);
    setCurrentPage(1);
    // The previous role's results are still on screen until the new ones arrive; don't accumulate them
    setAccumulatedResults(topTalentData?.results ?? null);
  } else if (topTalentData?.results && topTalentData.results !== accumulatedResults) {
    // Accumulate all players and cities from API responses
    const results = topTalentData.results;
    setAccumulatedResults(results);

    const existingIds = new Set(allPlayers.map((p) => p.playerId));
    const newPlayers = results.filter((player) => !existingIds.has(player.playerId));
    if (newPlayers.length > 0) setAllPlayers([...allPlayers, ...newPlayers]);

    // Always accumulate cities from all responses, regardless of city filter
    // This ensures we have all cities available in the dropdown even when a filter is applied
    const citiesFromResponse = results
      .map((player) => player.city)
      .filter((city): city is string => Boolean(city));
    setAllCities(Array.from(new Set([...allCities, ...citiesFromResponse])).sort());
  }

  // Get unique cities - use accumulated cities instead of just current results
  const cities = useMemo(() => {
    return allCities;
  }, [allCities]);

  // Filter players locally by search query - search through all accumulated players
  const filteredPlayers = useMemo(() => {
    // If there's a search query, search through all accumulated players
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return allPlayers.filter((player) =>
        player.name.toLowerCase().includes(query)
      );
    }
    
    // If no search query, show current page results
    return topTalentData?.results || [];
  }, [allPlayers, topTalentData?.results, searchQuery]);


  const skills = ["batsman", "bowler", "allrounder", "wicketkeeper"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Talent</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Players with the best performances
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-4 bg-muted/30 rounded-xl border border-borderShadcn/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search by player name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-primary w-full"
                />
              </div>

              {/* City Filter */}
              <Select
                value={cityFilter}
                onChange={(value: string | React.ChangeEvent<HTMLSelectElement>) => {
                  const cityValue = typeof value === 'string' 
                    ? value 
                    : (value as React.ChangeEvent<HTMLSelectElement>)?.target?.value || '';
                  setCityFilter(cityValue);
                  setCurrentPage(1);
                }}
                placeholder="All Cities"
                className="w-full border-2 focus:border-primary"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>

              {/* Skill Filter */}
              <Select
                value={skillFilter}
                onChange={(value: string | React.ChangeEvent<HTMLSelectElement>) => {
                  const skillValue = typeof value === 'string' 
                    ? value 
                    : (value as React.ChangeEvent<HTMLSelectElement>)?.target?.value || 'batsman';
                  setSkillFilter(skillValue);
                  setCurrentPage(1);
                }}
                placeholder="Select Skill"
                className="w-full border-2 focus:border-primary"
              >
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Top Talent Table */}
          <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
            {isLoadingTopTalent ? (
              <div className="h-24 flex items-center justify-center">
                <span className="text-muted-foreground">Loading players...</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Wickets</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!filteredPlayers || filteredPlayers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {searchQuery.trim() ? "No players found matching your search." : "No players found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlayers.map((player) => (
                        <TableRow
                          key={player.playerId}
                          className="cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => navigate(`/players/${player.playerId}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={player.profilePicture || player.teams[0]?.logo || undefined}
                                  alt={player.name}
                                />
                                <AvatarFallback className="bg-primary text-white">
                                  {player.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{player.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {player.teams[0]?.name || "N/A"}
                          </TableCell>
                          <TableCell>{player.city || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {player.playingRole || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {player.stats.runs}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {player.stats.wickets}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {(player.stats.average ?? 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {topTalentData && topTalentData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-borderShadcn/50">
                    <div className="text-sm text-muted-foreground">
                      Showing page {topTalentData.page} of {topTalentData.totalPages} 
                      {" "}({topTalentData.totalResults} total results)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || isLoadingTopTalent}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, topTalentData.totalPages) }, (_, i) => {
                          let pageNum;
                          if (topTalentData.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= topTalentData.totalPages - 2) {
                            pageNum = topTalentData.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={isLoadingTopTalent}
                              className="min-w-[40px]"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(topTalentData.totalPages, prev + 1))}
                        disabled={currentPage === topTalentData.totalPages || isLoadingTopTalent}
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
      </CardContent>
    </Card>
  );
}

