# Public notifications

The shared public header reads match activity and existing league announcements. Public pages keep using the same official fixture, results, standings and player-statistics queries. The feed refreshes with TanStack Query polling.

## Match activity migration

Apply `supabase/migrations/20261125160000_public_match_notifications.sql` to a database that already has the league schema. The migration adds `public_match_notifications` and an after-write trigger on `matches`. The activity writes commit in the same transaction as the source change. Fixture publications and status and schedule changes produce durable entries. Rapid score changes share one entry per fixture, and final-score corrections update the original result entry. An official result includes a standings link.

The migration backfills publications, current live scores and statuses, and official results from existing match rows. Earlier reschedules and intermediate scores cannot be reconstructed. Before deployment, the app shows announcements and the latest activity it can derive from existing public match rows.

## Access and read state

Anonymous and authenticated visitors can select activity for currently public matches. The activity table grants no client write access. The trigger records snapshots from the existing match workflow and excludes draft match statuses. It also hides live scores for finished matches and final results for reopened matches. Existing match-writing permissions still govern the source records. The feed stores fixture facts and club names without staff identity or contact information.

The existing administrator announcement form publishes on save and supports edits and removal. The current announcement schema has no draft publication workflow. The feed selects only its public message fields. Visitors store read identifiers in their own browser, with revisions used to surface edits and corrected scores again.
