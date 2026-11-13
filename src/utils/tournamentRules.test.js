import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculatePlayerProfileMetrics,
  mapSquadToFormationSlots,
  validatePlayerAllocation,
  calculateTeamFormAndStats,
} from './tournamentRules.js'

test('calculatePlayerProfileMetrics computes baseline 75 OVR when no matches played', () => {
  const player = { id: 'p1', name: 'Erling Haaland', position: 'FW', is_goalkeeper: false, team_id: 't1' }
  const metrics = calculatePlayerProfileMetrics({
    player,
    playerStatsRow: { goals: 0, yellow_cards: 0, red_cards: 0 },
    teamMatches: [],
    matchEvents: [],
  })

  assert.equal(metrics.overallRating, 75)
  assert.equal(metrics.goals, 0)
  assert.equal(metrics.matchesPlayed, 0)
  assert.equal(metrics.isGoalkeeper, false)
})

test('calculatePlayerProfileMetrics transparently increases OVR with goals, appearances, and wins', () => {
  const player = { id: 'p1', name: 'Erling Haaland', position: 'FW', is_goalkeeper: false, team_id: 't1' }
  const teamMatches = [
    {
      id: 'm1',
      status: 'completed',
      home_team_id: 't1',
      away_team_id: 't2',
      home_score: 2,
      away_score: 0,
      current_minute: 50,
    },
  ]
  const metrics = calculatePlayerProfileMetrics({
    player,
    playerStatsRow: { goals: 2, yellow_cards: 1, red_cards: 0 },
    teamMatches,
    matchEvents: [],
  })

  // Base 75 + appearance(+2) + 2 goals(+6) + 1 cleanSheet for FW(+1) + 1 win(+1) - 1 YC(-1) = 84
  assert.equal(metrics.overallRating, 84)
  assert.equal(metrics.matchesPlayed, 1)
  assert.equal(metrics.minutesPlayed, 50)
  assert.equal(metrics.cleanSheets, 1)
})

test('validatePlayerAllocation enforces 1 GK and 4 Outfield per team rules', () => {
  const existingSquad = [
    { id: 'gk1', name: 'David De Gea', position: 'GK', is_goalkeeper: true, team_id: 't1' },
    { id: 'o1', name: 'Virgil van Dijk', position: 'CB', is_goalkeeper: false, team_id: 't1' },
  ]
  const secondGK = { id: 'gk2', name: 'Manuel Neuer', position: 'GK', is_goalkeeper: true, team_id: null }
  const outfieldCandidate = { id: 'o2', name: 'Luka Modric', position: 'MF', is_goalkeeper: false, team_id: null }

  const gkCheck = validatePlayerAllocation({
    player: secondGK,
    targetTeamId: 't1',
    allPlayers: existingSquad,
  })
  assert.equal(gkCheck.valid, false)

  const outfieldCheck = validatePlayerAllocation({
    player: outfieldCandidate,
    targetTeamId: 't1',
    allPlayers: existingSquad,
  })
  assert.equal(outfieldCheck.valid, true)
})

test('mapSquadToFormationSlots maps 1 GK and 4 Outfield players without duplicates', () => {
  const squad = [
    { id: 'gk1', name: 'David De Gea', position: 'GK', is_goalkeeper: true },
    { id: 'p1', name: 'Virgil van Dijk', position: 'CB', is_goalkeeper: false },
    { id: 'p2', name: 'Kevin De Bruyne', position: 'MF', is_goalkeeper: false },
    { id: 'p3', name: 'Jude Bellingham', position: 'MF', is_goalkeeper: false },
    { id: 'p4', name: 'Erling Haaland', position: 'FW', is_goalkeeper: false },
  ]

  const slots = mapSquadToFormationSlots(squad, '1-2-1')
  assert.equal(slots.length, 5)
  assert.equal(slots[0].player.id, 'gk1')
  const assignedIds = slots.map((s) => s.player?.id).filter(Boolean)
  assert.equal(new Set(assignedIds).size, 5)
})

test('calculateTeamFormAndStats computes points, GD, and W-D-L form accurately', () => {
  const matches = [
    { match_number: 1, status: 'completed', home_team_id: 't1', away_team_id: 't2', home_score: 3, away_score: 1 },
    { match_number: 2, status: 'completed', home_team_id: 't3', away_team_id: 't1', home_score: 0, away_score: 0 },
  ]
  const res = calculateTeamFormAndStats('t1', matches)
  assert.equal(res.matchesPlayed, 2)
  assert.equal(res.won, 1)
  assert.equal(res.drawn, 1)
  assert.equal(res.points, 4)
  assert.equal(res.goalDifference, 2)
  assert.equal(res.cleanSheets, 1)
  assert.deepEqual(res.form, ['W', 'D'])
})

test('cloudinaryService validates PNG/JPG/WebP, enforces f_png,q_auto delivery, and detects baked-in checkerboards', async () => {
  const { cloudinaryService } = await import('../services/cloudinary/cloudinary.service.js')

  // Valid PNG, JPG, WebP
  assert.equal(
    cloudinaryService.validateImageFile({ name: 'messi.png', type: 'image/png', size: 250000 }),
    true
  )
  assert.equal(
    cloudinaryService.validateImageFile({ name: 'player.jpg', type: 'image/jpeg', size: 120000 }),
    true
  )
  assert.equal(
    cloudinaryService.validateImageFile({ name: 'cutout.webp', type: 'image/webp', size: 95000 }),
    true
  )

  // Reject unsupported format
  assert.throws(
    () => cloudinaryService.validateImageFile({ name: 'doc.pdf', type: 'application/pdf', size: 5000 }),
    /Unsupported file format/
  )

  // Reject oversized file (> 10MB)
  assert.throws(
    () =>
      cloudinaryService.validateImageFile({
        name: 'huge.png',
        type: 'image/png',
        size: 12 * 1024 * 1024,
      }),
    /exceeds the 10MB/
  )

  // Cloudinary URL optimization injects f_png,q_auto,w_500,h_620,c_limit
  const rawCloudUrl =
    'https://res.cloudinary.com/demo/image/upload/v1700000000/supercup_players/messi_cutout.png'
  const optimized = cloudinaryService.getOptimizedPortraitUrl(rawCloudUrl)
  assert.equal(
    optimized,
    'https://res.cloudinary.com/demo/image/upload/f_png,q_auto,w_500,h_620,c_limit/v1700000000/supercup_players/messi_cutout.png'
  )

  // Local and data URLs remain untouched
  assert.equal(
    cloudinaryService.getOptimizedPortraitUrl('/assets/aistudio/pngwing.com_3118625d.png'),
    '/assets/aistudio/pngwing.com_3118625d.png'
  )

  // 1. Genuine transparent PNG pixel buffer (transparent margins, opaque center subject)
  const w = 32
  const h = 32
  const genuinePngBuffer = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const inCenter = x >= 10 && x <= 22 && y >= 8 && y <= 28
      genuinePngBuffer[idx] = 200
      genuinePngBuffer[idx + 1] = 40
      genuinePngBuffer[idx + 2] = 40
      genuinePngBuffer[idx + 3] = inCenter ? 255 : 0
    }
  }
  const genuineReport = cloudinaryService.analyzeImagePixels(genuinePngBuffer, w, h, { isPng: true })
  assert.equal(genuineReport.hasMeaningfulTransparency, true)
  assert.equal(genuineReport.hasBakedCheckerboard, false)
  assert.equal(genuineReport.warning, null)

  // 2. Fake PNG with baked-in grey-and-white 4x4 checkerboard (alpha = 255 everywhere)
  const fakeCheckerBuffer = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const isWhiteCell = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0
      const shade = isWhiteCell ? 255 : 204
      fakeCheckerBuffer[idx] = shade
      fakeCheckerBuffer[idx + 1] = shade
      fakeCheckerBuffer[idx + 2] = shade
      fakeCheckerBuffer[idx + 3] = 255
    }
  }
  const fakeReport = cloudinaryService.analyzeImagePixels(fakeCheckerBuffer, w, h, { isPng: true })
  assert.equal(fakeReport.hasMeaningfulTransparency, false)
  assert.equal(fakeReport.hasBakedCheckerboard, true)
  assert.match(fakeReport.warning, /Checkerboard background detected/)
})


