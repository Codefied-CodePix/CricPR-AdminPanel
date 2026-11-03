---
name: Player Avatar Fallback
overview: Use `/new_logo.png` as the shared fallback whenever a player has no profile picture, via a small helper and updates to every player avatar call site (not team/admin/tournament logos).
todos:
  - id: avatar-helper
    content: Add resolvePlayerAvatar helper pointing to /new_logo.png
    status: completed
  - id: update-player-pages
    content: Wire helper into PlayerDetail, TeamDetail, TopTalentSection, Stats
    status: completed
isProject: false
---

# Player profile fallback image

## Approach

Add one shared helper and use it everywhere **player** avatars are rendered. Leave admin Profile, team logos, tournament logos, and user-signup avatars unchanged.

Public Vite asset path: [`public/new_logo.png`](public/new_logo.png) → served as `/new_logo.png`.

## Implementation

1. Add [`src/utils/playerAvatar.ts`](src/utils/playerAvatar.ts):

```ts
export const PLAYER_AVATAR_FALLBACK = '/new_logo.png'

export function resolvePlayerAvatar(url?: string | null): string {
  const trimmed = url?.trim()
  return trimmed ? trimmed : PLAYER_AVATAR_FALLBACK
}
```

2. Replace `ui-avatars.com` / empty player image fallbacks at these call sites:

| File | Current behavior |
|------|------------------|
| [`src/pages/players/PlayerDetail.tsx`](src/pages/players/PlayerDetail.tsx) | `profileImage \|\| ui-avatars` |
| [`src/pages/teams/TeamDetail.tsx`](src/pages/teams/TeamDetail.tsx) | `playerProfilePic \|\| ui-avatars` (roster + best-player blocks) |
| [`src/pages/dashboard/components/TopTalentSection.tsx`](src/pages/dashboard/components/TopTalentSection.tsx) | `profilePicture \|\| team logo \|\| undefined` → use `resolvePlayerAvatar(profilePicture)` |
| [`src/pages/stats/Stats.tsx`](src/pages/stats/Stats.tsx) | Always `ui-avatars` for leaderboard rows → `/new_logo.png` (API has no photo today) |

3. Keep letter `AvatarFallback` initials as a last resort if the image fails to load; primary `src` when null/empty will be `/new_logo.png`.

## Out of scope

- Admin [`Profile.tsx`](src/pages/profile/Profile.tsx)
- Team/tournament logos ([`MatchDetail.tsx`](src/pages/matches/MatchDetail.tsx), [`TournamentDetail.tsx`](src/pages/tournaments/TournamentDetail.tsx))
- [`LatestUserSignupsTable.tsx`](src/pages/dashboard/components/LatestUserSignupsTable.tsx) (users, not players)
