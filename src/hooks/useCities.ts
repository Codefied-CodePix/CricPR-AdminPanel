import { useQuery } from '@tanstack/react-query'
import { citiesApi } from '../services/citiesApi'

/**
 * Distinct cities for filter dropdowns
 */
export function useCities() {
  const citiesQuery = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getCities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  const cities = (citiesQuery.data ?? [])
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((city) => ({ value: city, label: city }))

  return { cities, isLoading: citiesQuery.isLoading }
}
