import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '../../utils/cn'
import {
  PLAYER_AVATAR_FALLBACK,
  resolvePlayerAvatar,
} from '../../utils/playerAvatar'

interface PlayerAvatarProps {
  src?: string | null
  name?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  alt?: string
}

function initialsFromName(name?: string): string {
  if (!name?.trim()) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Player avatar that falls back to `/new_logo.png` when the URL is
 * missing/empty OR the image fails to load (broken/invalid URL).
 */
export function PlayerAvatar({
  src,
  name,
  className,
  imageClassName,
  fallbackClassName,
  alt,
}: PlayerAvatarProps) {
  const resolved = resolvePlayerAvatar(src)
  const [imgSrc, setImgSrc] = useState(resolved)

  useEffect(() => {
    setImgSrc(resolvePlayerAvatar(src))
  }, [src])

  return (
    <Avatar className={className}>
      <AvatarImage
        src={imgSrc}
        alt={alt || name || 'Player'}
        className={imageClassName}
        onError={() => {
          if (imgSrc !== PLAYER_AVATAR_FALLBACK) {
            setImgSrc(PLAYER_AVATAR_FALLBACK)
          }
        }}
      />
      <AvatarFallback
        className={cn('bg-primary text-white text-xs', fallbackClassName)}
      >
        {initialsFromName(name)}
      </AvatarFallback>
    </Avatar>
  )
}
