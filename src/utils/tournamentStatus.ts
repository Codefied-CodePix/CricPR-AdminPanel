export function tournamentStatusVariant(
  status: string
): 'success' | 'destructive' | 'warning' | 'secondary' {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'ongoing':
      return 'destructive'
    case 'upcoming':
    case 'pending':
      return 'warning'
    default:
      return 'secondary'
  }
}
