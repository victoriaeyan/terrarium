# Hackathon log

- **Project:** Terrarium
- **What it does:** A pixel-art village for a friend group where each friend's avatar, house, and daily routine show what they're up to, with Convex-backed sign-in, moments, and neighbors.
- **Live app:** not deployed
- **Repo:** https://github.com/victoriaeyan/terrarium
- **Frontend:** not deployed
- **Convex deployment:** not deployed
- **Components:** @convex-dev/auth (auth, authPassword, authUsername)
- **Convex features:** schema, tables, indexes, queries, mutations, internal mutations, realtime queries
- **Auth:** Convex Auth
- **AI models:** none
- **Started:** 2026-11-15T18:13:44Z
- **Last updated:** 2026-11-15T18:37:48Z

## Log

### 2026-11-15 - working tree
Scaffolded an Expo Router + TypeScript app and built the village: a tile map with
roads, buildings, and houses, animated pixel avatars that walk between places on a
simulated daily schedule, a time scrubber with timelapse, friend profiles with
summaries, gifts, and hangout suggestions, plus Chronicle and You tabs. Friend data
is sample data (`src/lib/world.ts`, `src/lib/sim.ts`, `src/components/village-map.tsx`).

### 2026-11-15 - working tree
Added the Convex backend: `users`, `moments` (indexed `by_author`), and `villagers`
tables, a query for the signed-in user's moments and a mutation to add one, and a
list/add pair for villagers shown on the Neighbors tab and in Newcomers' Lane.
Sign-in uses Convex Auth v2 username + password, with the session stored in
expo-secure-store. Convex features: schema, indexes, queries, mutations, realtime
queries (`convex/schema.ts`, `convex/moments.ts`, `convex/villagers.ts`,
`convex/auth.ts`, `convex/convex.config.ts`, `src/lib/convex.ts`).
