import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RoleSeeder } from './modules/users/seeds/role.seeder';
import { Role } from './modules/users/entities/role.entity';
import { User } from './modules/users/entities/user.entity';

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
    TypeOrmModule.forFeature([Role, User]),
    AuthModule,
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
