import api, { handleApiError, unwrapData } from './api'
import type { V2Envelope } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface UserRole {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  gender?: string
  email: string
  roles: UserRole[]
  permissions?: Array<{ id: string; resource: string; action: string }>
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  provider?: string
  status?: string
  fcmToken?: string | null
  profilePicture?: string | null
}

export interface Token {
  token: string
  expires: string
}

export interface AuthTokens {
  access: Token
  refresh: Token
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface UploadContentResponse {
  url?: string
  updated?: boolean
  entity?: string
  id?: string
  field?: string
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<V2Envelope<LoginResponse>>(
        '/auth/admin/login',
        credentials
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<V2Envelope<LoginResponse>>('/auth/refresh', {
        refreshToken,
      })
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  editName: async (name: string): Promise<User> => {
    try {
      const response = await api.patch<V2Envelope<User>>('/admin/edit-name', { name })
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload profile picture via contents API (persists when type=profilePicture).
   */
  editProfilePhoto: async (file: File): Promise<UploadContentResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profilePicture')

      const response = await api.post<V2Envelope<UploadContentResponse>>(
        '/contents/upload',
        formData
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set profile picture URL explicitly (optional follow-up to upload).
   */
  setProfilePictureUrl: async (profilePicture: string): Promise<User> => {
    try {
      const response = await api.patch<V2Envelope<User>>('/admin/edit-profilePhoto', {
        profilePicture,
      })
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
