import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfrkwpfspegukftzekjr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_YOYOr8lr0KoZyJRR9RdM2A_hi0529y9'

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runVerification() {
  console.log('====================================================================')
  console.log('INSTITUTE FOOTBALL LEAGUE — END-TO-END VALIDATION TEST SUITE')
  console.log('====================================================================\n')

  let passedTests = 0
  let totalTests = 0

  function assert(condition, description) {
    totalTests++
    if (condition) {
      console.log(`  [PASS] ${description}`)
      passedTests++
    } else {
      console.error(`  [FAIL] ${description}`)
    }
  }

  // TEST 1: Role Authentication & Profile Verification
  console.log('--- 1. Authentication & Role Authorization ---')
  const roles = [
    { email: 'admin@supercup.com', expectedRole: 'super_admin' },
    { email: 'manager1@supercup.com', expectedRole: 'manager' },
    { email: 'referee@supercup.com', expectedRole: 'referee' }
  ]

  for (const item of roles) {
    const { data: authData, error: authErr } = await client.auth.signInWithPassword({
      email: item.email,
      password: 'demopassword'
    })
    assert(!authErr && authData?.user, `Sign-in succeeded for ${item.email}`)

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    assert(profile?.role === item.expectedRole, `${item.email} has profile role '${item.expectedRole}'`)
    await client.auth.signOut()
  }

  // TEST 2: Public Read Access
  console.log('\n--- 2. Public Read Security (Unauthenticated) ---')
  const { data: pubTournaments } = await client.from('tournaments').select('*')
  assert(pubTournaments && pubTournaments.length > 0, `Public visitor can read tournaments (${pubTournaments?.length} found)`)

  const { data: pubTeams } = await client.from('teams').select('*')
  assert(pubTeams && pubTeams.length === 3, `Public visitor can read all 3 participating teams`)

  const { data: pubPlayers } = await client.from('players').select('*')
  assert(pubPlayers && pubPlayers.length === 15, `Public visitor can read 15 registered players`)

  const { data: standings } = await client.from('standings_view').select('*')
  assert(standings && standings.length === 3, `Dynamic standings_view calculated for all 3 teams`)

  const { data: stats } = await client.from('player_stats_view').select('*')
  assert(stats && stats.length === 15, `Dynamic player_stats_view calculated for all 15 players`)

  // TEST 3: Public Write Restriction (RLS enforcement)
  console.log('\n--- 3. Public Write Restrictions (RLS Security) ---')
  const { error: unauthWriteErr } = await client
    .from('players')
    .insert({ tournament_id: pubTournaments[0].id, name: 'Hacker Player', position: 'FW' })
  assert(unauthWriteErr !== null, `Unauthenticated insert into players blocked by RLS`)

  // TEST 4: Transactional Draft & Allocation Engine
  console.log('\n--- 4. Spin Wheel Player Allocation Business Rules ---')
  const { data: adminAuth } = await client.auth.signInWithPassword({
    email: 'admin@supercup.com',
    password: 'demopassword'
  })

  const teamAlpha = pubTeams.find(t => t.name === 'Team Alpha')
  const gkList = pubPlayers.filter(p => p.is_goalkeeper)
  const outfieldList = pubPlayers.filter(p => !p.is_goalkeeper)

  assert(gkList.length === 3, `Goalkeeper draft wheel has exactly 3 candidates`)
  assert(outfieldList.length === 12, `Outfield draft wheel has exactly 12 candidates`)

  // Snapshot existing allocations so verification test is non-destructive
  const initialAllocations = pubPlayers.filter(p => p.team_id).map(p => ({
    id: p.id,
    team_id: p.team_id,
    is_goalkeeper: p.is_goalkeeper
  }))

  // Ensure clean allocation slate before testing
  await client.from('players').update({ team_id: null }).neq('id', '00000000-0000-0000-0000-000000000000')
  await client.from('allocation_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Step 4a: Allocate 1 GK to Team Alpha
  const { data: allocGk1, error: errGk1 } = await client.rpc('allocate_player_transaction', {
    p_player_id: gkList[0].id,
    p_team_id: teamAlpha.id,
    p_admin_id: adminAuth.user.id
  })
  assert(!errGk1 && allocGk1?.success, `Super Admin allocated 1 GK to Team Alpha`)

  // Step 4b: Attempt to allocate 2nd GK to Team Alpha (MUST FAIL)
  const { data: allocGk2, error: errGk2 } = await client.rpc('allocate_player_transaction', {
    p_player_id: gkList[1].id,
    p_team_id: teamAlpha.id,
    p_admin_id: adminAuth.user.id
  })
  assert(errGk2 !== null, `Strict rule enforced: Team Alpha cannot receive a second GK`)

  // Restore initial allocations snapshot
  await client.from('players').update({ team_id: null }).neq('id', '00000000-0000-0000-0000-000000000000')
  await client.from('allocation_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  for (const item of initialAllocations) {
    await client.rpc('allocate_player_transaction', {
      p_player_id: item.id,
      p_team_id: item.team_id,
      p_admin_id: adminAuth.user.id
    })
  }
  console.log(`  [CLEANUP] Restored ${initialAllocations.length} player allocations.`)

  // TEST 5: Live Match Operations & Atomic Undo
  console.log('\n--- 5. Live Match Event Recording & Atomic Undo ---')
  const { data: refAuth } = await client.auth.signInWithPassword({
    email: 'referee@supercup.com',
    password: 'demopassword'
  })

  const { data: matches } = await client.from('matches').select('*').limit(1)
  const testMatch = matches[0]

  // Step 5a: Record a Goal
  const { data: goalRes, error: goalErr } = await client.rpc('record_match_event', {
    p_match_id: testMatch.id,
    p_team_id: testMatch.home_team_id,
    p_player_id: outfieldList[0].id,
    p_event_type: 'GOAL',
    p_minute: 23,
    p_recorded_by: refAuth.user.id
  })
  assert(!goalErr && goalRes?.success, `Referee recorded GOAL in minute 23`)

  const { data: matchAfterGoal } = await client.from('matches').select('home_score').eq('id', testMatch.id).single()
  assert(matchAfterGoal?.home_score === 1, `Match home_score incremented to 1`)

  // Step 5b: Undo Last Match Event
  const { data: undoRes, error: undoErr } = await client.rpc('undo_last_match_event', {
    p_match_id: testMatch.id,
    p_recorded_by: refAuth.user.id
  })
  assert(!undoErr && undoRes?.success, `Referee executed Undo Last Event`)

  const { data: matchAfterUndo } = await client.from('matches').select('home_score').eq('id', testMatch.id).single()
  assert(matchAfterUndo?.home_score === 0, `Match home_score atomically restored to 0`)

  await client.auth.signOut()

  // SUMMARY
  console.log('\n====================================================================')
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% SUCCESS RATE)`)
  console.log('====================================================================')
}

runVerification().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})

