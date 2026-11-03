export const PLAYER_AVATAR_FALLBACK = '/new_logo.png'

export function resolvePlayerAvatar(url?: string | null): string {
  const trimmed = url?.trim()
  return trimmed ? trimmed : PLAYER_AVATAR_FALLBACK
}
