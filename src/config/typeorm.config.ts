import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
  username: configService.get<string>('DB_USERNAME') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || '',
  database: configService.get<string>('DB_DATABASE') || 'itravelly',
  autoLoadEntities: true,
  synchronize: true, // Cambia a false en producción
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
}); 