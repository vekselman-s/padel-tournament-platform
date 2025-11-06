import { PrismaClient, UserRole, Gender, TournamentFormat, TournamentStatus, TournamentVisibility, MatchState } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean database
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.ranking.deleteMany()
  await prisma.standing.deleteMany()
  await prisma.group.deleteMany()
  await prisma.resultReport.deleteMany()
  await prisma.setScore.deleteMany()
  await prisma.match.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.team.deleteMany()
  await prisma.category.deleteMany()
  await prisma.scheduleBlock.deleteMany()
  await prisma.tournamentFavorite.deleteMany()
  await prisma.tournament.deleteMany()
  await prisma.court.deleteMany()
  await prisma.club.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleaned database')

  // ============================================================================
  // USERS
  // ============================================================================

  const admin = await prisma.user.create({
    data: {
      email: 'admin@padel.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      locale: 'es',
    },
  })

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@padel.com',
      name: 'Juan Organizer',
      role: UserRole.ORGANIZER,
      locale: 'es',
    },
  })

  const players = await Promise.all([
    prisma.user.create({
      data: { email: 'carlos@padel.com', name: 'Carlos García', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'maria@padel.com', name: 'María Fernández', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'pedro@padel.com', name: 'Pedro Martínez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'ana@padel.com', name: 'Ana López', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'luis@padel.com', name: 'Luis Rodríguez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'laura@padel.com', name: 'Laura Sánchez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'jorge@padel.com', name: 'Jorge Pérez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'sofia@padel.com', name: 'Sofía González', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'diego@padel.com', name: 'Diego Ramírez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'elena@padel.com', name: 'Elena Torres', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'miguel@padel.com', name: 'Miguel Ruiz', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'carmen@padel.com', name: 'Carmen Díaz', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'javier@padel.com', name: 'Javier Moreno', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'patricia@padel.com', name: 'Patricia Álvarez', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'ricardo@padel.com', name: 'Ricardo Romero', role: UserRole.PLAYER },
    }),
    prisma.user.create({
      data: { email: 'isabel@padel.com', name: 'Isabel Navarro', role: UserRole.PLAYER },
    }),
  ])

  console.log(`👥 Created ${players.length + 2} users`)

  // ============================================================================
  // CLUB & COURTS
  // ============================================================================

  const club = await prisma.club.create({
    data: {
      name: 'Club Padel Madrid',
      description: 'Premier padel club in Madrid',
      address: 'Calle Padel 123',
      city: 'Madrid',
      country: 'Spain',
      latitude: 40.4168,
      longitude: -3.7038,
      ownerId: organizer.id,
    },
  })

  const courts = await Promise.all([
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Court 1',
        surface: 'GRASS',
        indoor: false,
        hasLighting: true,
      },
    }),
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Court 2',
        surface: 'GRASS',
        indoor: false,
        hasLighting: true,
      },
    }),
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Court 3',
        surface: 'INDOOR',
        indoor: true,
        hasLighting: true,
      },
    }),
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Court 4',
        surface: 'INDOOR',
        indoor: true,
        hasLighting: true,
      },
    }),
  ])

  console.log(`🎾 Created club with ${courts.length} courts`)

  // ============================================================================
  // TOURNAMENT 1: Single Elimination (16 teams)
  // ============================================================================

  const tournament1 = await prisma.tournament.create({
    data: {
      clubId: club.id,
      organizerId: organizer.id,
      name: 'Madrid Open 2025',
      description: 'Annual single elimination tournament',
      startAt: new Date('2025-03-01'),
      endAt: new Date('2025-03-03'),
      location: 'Madrid, Spain',
      visibility: TournamentVisibility.PUBLIC,
      status: TournamentStatus.REGISTRATION,
      format: TournamentFormat.SINGLE_ELIM,
      maxTeams: 16,
      minTeams: 8,
      entryFeeCents: 5000, // 50 EUR
      currency: 'EUR',
      shareSlug: 'madrid-open-2025',
      languages: ['es', 'en'], // PostgreSQL supports arrays
    },
  })

  const category1 = await prisma.category.create({
    data: {
      tournamentId: tournament1.id,
      name: 'Open Masculino',
      gender: Gender.M,
      level: 4,
    },
  })

  // Create 16 teams for tournament 1
  const teams1 = []
  for (let i = 0; i < 8; i++) {
    const team = await prisma.team.create({
      data: {
        tournamentId: tournament1.id,
        categoryId: category1.id,
        name: `Team ${i + 1}`,
        player1Id: players[i * 2].id,
        player2Id: players[i * 2 + 1].id,
        seed: i + 1,
        elo: 1500 - i * 50,
      },
    })
    teams1.push(team)

    // Create registrations
    await prisma.registration.create({
      data: {
        tournamentId: tournament1.id,
        teamId: team.id,
        status: 'CONFIRMED',
        paid: true,
        paymentProvider: 'STRIPE',
        paymentStatus: 'COMPLETED',
        amountCents: 5000,
        currency: 'EUR',
        paidAt: new Date(),
      },
    })
  }

  console.log(`🏆 Created tournament "${tournament1.name}" with ${teams1.length} teams`)

  // ============================================================================
  // TOURNAMENT 2: Americano (12 players)
  // ============================================================================

  const tournament2 = await prisma.tournament.create({
    data: {
      clubId: club.id,
      organizerId: organizer.id,
      name: 'Torneo Americano Primavera',
      description: 'Americano format tournament',
      startAt: new Date('2025-03-15'),
      endAt: new Date('2025-03-15'),
      location: 'Madrid, Spain',
      visibility: TournamentVisibility.PUBLIC,
      status: TournamentStatus.DRAFT,
      format: TournamentFormat.AMERICANO,
      maxTeams: 20,
      minTeams: 8,
      entryFeeCents: 2500, // 25 EUR
      currency: 'EUR',
      shareSlug: 'americano-primavera-2025',
    },
  })

  const category2 = await prisma.category.create({
    data: {
      tournamentId: tournament2.id,
      name: 'Mixto',
      gender: Gender.X,
      level: 3,
    },
  })

  console.log(`🏆 Created tournament "${tournament2.name}"`)

  // ============================================================================
  // GENERATE MATCHES FOR TOURNAMENT 1
  // ============================================================================

  // Round of 8 (Quarterfinals)
  const quarterMatches = []
  for (let i = 0; i < 4; i++) {
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament1.id,
        categoryId: category1.id,
        round: 3, // QF
        matchNumber: i + 1,
        teamAId: teams1[i * 2].id,
        teamBId: teams1[i * 2 + 1].id,
        courtId: courts[i % courts.length].id,
        scheduledAt: new Date('2025-03-01T10:00:00Z'),
        state: MatchState.PENDING,
        bestOf: 3,
      },
    })
    quarterMatches.push(match)
  }

  console.log(`🎮 Created ${quarterMatches.length} quarter-final matches`)

  // Create some sample result reports
  await prisma.resultReport.create({
    data: {
      matchId: quarterMatches[0].id,
      reportedById: players[0].id,
      status: 'REPORTED',
      payloadJson: {
        sets: [
          { gamesA: 6, gamesB: 4 },
          { gamesA: 6, gamesB: 2 },
        ],
      },
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
