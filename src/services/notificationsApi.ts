import api, { handleApiError, unwrapData, type V2Envelope } from './api'

export interface Notification {
  id?: string
  title: string
  body: string
  sendAt: string
  createdAt?: string
  read?: boolean
}

export interface NotificationsResponse {
  results: Notification[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export interface NotificationsParams {
  page?: number
  limit?: number
}

export interface SendNotificationPayload {
  title: string
  body: string
  /** User UUIDs — omit or empty to broadcast to all */
  userIds?: string[]
}

export const notificationsApi = {
  /**
   * Admin inbox (GET /notifications) — not broadcast history.
   * Kept for optional display; V2 has no admin broadcast history endpoint.
   */
  getNotifications: async (
    params: NotificationsParams = {}
  ): Promise<NotificationsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get<V2Envelope<Array<Record<string, unknown>>>>(
        `/notifications?${queryParams.toString()}`
      )
      const rows = Array.isArray(response.data.data) ? response.data.data : []
      const pagination = response.data.pagination
      return {
        results: rows.map((n) => ({
          id: String(n.id || ''),
          title: String(n.title || ''),
          body: String(n.body || ''),
          sendAt: String(n.createdAt || n.sendAt || new Date().toISOString()),
          createdAt: n.createdAt ? String(n.createdAt) : undefined,
          read: Boolean(n.read),
        })),
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 10,
        totalResults: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  sendNotification: async (payload: SendNotificationPayload): Promise<unknown> => {
    try {
      const body: SendNotificationPayload = {
        title: payload.title,
        body: payload.body,
      }
      if (payload.userIds && payload.userIds.length > 0) {
        body.userIds = payload.userIds
      }
      const response = await api.post<V2Envelope<unknown>>(
        '/admin/notifications/send',
        body
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
