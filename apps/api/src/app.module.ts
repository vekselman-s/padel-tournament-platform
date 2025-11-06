import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { TournamentsModule } from './modules/tournaments/tournaments.module'
import { TeamsModule } from './modules/teams/teams.module'
import { MatchesModule } from './modules/matches/matches.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { UsersModule } from './modules/users/users.module'
import { ClubsModule } from './modules/clubs/clubs.module'
import { NotificationsModule } from './modules/notifications/notifications.module'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    TournamentsModule,
    TeamsModule,
    MatchesModule,
    PaymentsModule,
    UsersModule,
    ClubsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
