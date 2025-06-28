import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CorporatesModule } from './modules/corporates/corporates.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { RoleSeeder } from './modules/users/seeds/role.seeder';
import { Role } from './modules/users/entities/role.entity';
import { User } from './modules/users/entities/user.entity';
import { ActivityType } from './modules/activities/entities/activity-type.entity';
import { Activity } from './modules/activities/entities/activity.entity';
import { Corporate } from './modules/corporates/entities/corporate.entity';
import { Branch } from './modules/corporates/entities/branch.entity';
import { Booking } from './modules/bookings/entities/booking.entity';
import { Promotion } from './modules/promotions/entities/promotion.entity';
import { VerificationCode } from './modules/auth/entities/verification-code.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 60 segundos
        limit: 100, // 100 requests por minuto
      },
      {
        ttl: 3600, // 1 hora
        limit: 1000, // 1000 requests por hora
      },
    ]),
    TypeOrmModule.forFeature([
      Role,
      User,
      ActivityType,
      Activity,
      Corporate,
      Branch,
      Booking,
      Promotion,
      VerificationCode,
    ]),
    AuthModule,
    UsersModule,
    ActivitiesModule,
    CorporatesModule,
    BookingsModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, RoleSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private roleSeeder: RoleSeeder) {}

  async onModuleInit() {
    // Ejecutar seeder de roles al iniciar la aplicación
    await this.roleSeeder.seed();
  }
}
