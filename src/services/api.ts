import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api/v2',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface V2Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface V2Envelope<T = unknown> {
  ok: boolean
  status: number
  invokedMethod?: string
  invokedEndpoint?: string
  responseTime?: number
  timestamp?: string
  message?: string
  data?: T
  pagination?: V2Pagination
  error?: string | { message?: string; code?: string }
}

export interface ApiError {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAuthData, logout, user } = useAuthStore.getState()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await axios.post<V2Envelope<{
      user: Record<string, unknown>
      tokens: {
        access: { token: string; expires: string }
        refresh: { token: string; expires: string }
      }
    }>>(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const payload = response.data?.data
    if (!payload?.tokens?.access?.token || !payload?.tokens?.refresh?.token) {
      logout()
      return null
    }
    const access = payload.tokens.access
    const refresh = payload.tokens.refresh

    const apiUser = payload.user as {
      id: string
      name: string
      email: string
      roles?: Array<{ id: string; name: string }>
      gender?: string
      isEmailVerified?: boolean
      isPhoneVerified?: boolean
      provider?: string
      status?: string
      fcmToken?: string | null
      profilePicture?: string | null
    }

    setAuthData({
      user: {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.roles?.[0]?.name || user?.role || 'admin',
        roles: apiUser.roles,
        gender: apiUser.gender,
        isEmailVerified: apiUser.isEmailVerified,
        isPhoneVerified: apiUser.isPhoneVerified,
        provider: apiUser.provider,
        status: apiUser.status,
        fcmToken: apiUser.fcmToken,
        profilePicture: apiUser.profilePicture ?? null,
        profilePhoto: apiUser.profilePicture ?? null,
      },
      token: access.token,
      refreshToken: refresh.token,
      tokenExpiry: access.expires,
    })

    return access.token
  } catch {
    logout()
    return null
  }
}

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const isAuthRoute =
      original?.url?.includes('/auth/admin/login') ||
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/logout')

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export function unwrapData<T>(response: AxiosResponse<V2Envelope<T>>): T {
  if (response.data?.data === undefined) {
    throw new Error(response.data?.message || 'Empty API response')
  }
  return response.data.data
}

export function unwrapList<T>(
  response: AxiosResponse<V2Envelope<T[] | { data?: T[] }>>
): { data: T[]; pagination?: V2Pagination } {
  const envelope = response.data
  const raw = envelope.data
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: T[] } | undefined)?.data)
      ? ((raw as { data: T[] }).data)
      : []
  return {
    data: list,
    pagination: envelope.pagination,
  }
}

export function unwrapEnvelopeExtras<T extends Record<string, unknown>>(
  response: AxiosResponse<V2Envelope<unknown> & T>
): V2Envelope<unknown> & T {
  return response.data
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message) {
        return data.message
      }
      if (typeof data.error === 'string' && data.error) {
        return data.error
      }
      if (
        data.error &&
        typeof data.error === 'object' &&
        data.error !== null &&
        typeof (data.error as { message?: unknown }).message === 'string'
      ) {
        return (data.error as { message: string }).message
      }
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
