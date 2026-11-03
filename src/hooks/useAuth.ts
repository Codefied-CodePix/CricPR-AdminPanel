import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/authApi'
import type { LoginRequest, LoginResponse, User as ApiUser } from '../services/authApi'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

function mapApiUser(user: ApiUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.roles?.[0]?.name || 'admin',
    roles: user.roles,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    provider: user.provider,
    status: user.status,
    fcmToken: user.fcmToken,
    profilePicture: user.profilePicture ?? null,
    profilePhoto: user.profilePicture ?? null,
  }
}

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const navigate = useNavigate()
  const { setAuthData, logout: storeLogout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      setAuthData({
        user: mapApiUser(data.user),
        token: data.tokens.access.token,
        refreshToken: data.tokens.refresh.token,
        tokenExpiry: data.tokens.access.expires,
      })
    },
    onError: (error: Error) => {
      console.error('Login error:', error)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken
      return authApi.logout(refreshToken || '')
    },
    onSuccess: () => {
      storeLogout()
      navigate('/login')
    },
    onError: () => {
      storeLogout()
      navigate('/login')
    },
  })

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: () => logoutMutation.mutate(),
    isLoading: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    error: loginMutation.error,
  }
}
