import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corporate } from './entities/corporate.entity';
import { Branch } from './entities/branch.entity';
import { CorporatesService } from './corporates.service';
import { CorporatesController } from './corporates.controller';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { VerificationCode } from '../auth/entities/verification-code.entity';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Corporate,
      Branch,
      User,
      Role,
      VerificationCode,
    ]),
  ],
  controllers: [CorporatesController],
  providers: [CorporatesService, EmailService],
  exports: [CorporatesService],
})
export class CorporatesModule {} 