import api, { handleApiError, type V2Envelope } from './api'

export const citiesApi = {
  getCities: async (): Promise<string[]> => {
    try {
      const response = await api.get<V2Envelope<string[]>>('/admin/cities')
      const rows = response.data.data
      return Array.isArray(rows) ? rows.filter((c) => typeof c === 'string' && c.trim()) : []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
