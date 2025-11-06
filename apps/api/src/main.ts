import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  })

  // Security
  app.use(helmet())

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // API prefix
  app.setGlobalPrefix('api')

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Padel Tournament Platform API')
    .setDescription('Complete API for managing padel tournaments')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tournaments', 'Tournament management')
    .addTag('teams', 'Team management')
    .addTag('matches', 'Match management')
    .addTag('payments', 'Payment processing')
    .addTag('users', 'User management')
    .addTag('clubs', 'Club management')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`🚀 API running on http://localhost:${port}`)
  console.log(`📚 Swagger docs on http://localhost:${port}/api`)
}

bootstrap()
