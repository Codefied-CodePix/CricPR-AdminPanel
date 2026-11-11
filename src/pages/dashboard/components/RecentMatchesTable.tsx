import { format } from "date-fns";
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
import type { RecentMatch } from "../../../services/dashboardApi";

interface RecentMatchesTableProps {
  data: RecentMatch[] | undefined;
  isLoading: boolean;
}

export function RecentMatchesTable({ data, isLoading }: RecentMatchesTableProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Tournament / Match Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-muted-foreground">Loading matches...</span>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No matches found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((match) => (
                <TableRow 
                  key={match.id}
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <TableCell>
                    {match.teams}
                  </TableCell>
                  <TableCell>{match.tournamentName || match.matchType}</TableCell>
                  <TableCell>
                    {match.startedAt ? format(new Date(match.startedAt), "MMM dd, yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        match.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : match.status === "live"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {match.status}
                    </span>
                  </TableCell>
                  <TableCell>{match.result || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

