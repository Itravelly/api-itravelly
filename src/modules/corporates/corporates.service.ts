import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Corporate } from './entities/corporate.entity';
import { Branch } from './entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { Role, UserRole } from '../users/entities/role.entity';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { EmailService } from '../auth/email.service';
import { VerificationCode } from '../auth/entities/verification-code.entity';

@Injectable()
export class CorporatesService {
  constructor(
    @InjectRepository(Corporate)
    private corporateRepository: Repository<Corporate>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    private emailService: EmailService,
  ) {}

  async register(registerCorporateDto: RegisterCorporateDto): Promise<{ message: string; corporateId: number }> {
    // Check if email already exists
    const existingCorporate = await this.corporateRepository.findOne({
      where: { email: registerCorporateDto.email }
    });

    if (existingCorporate) {
      throw new ConflictException('Email already registered');
    }

    // Get admin role
    const adminRole = await this.roleRepository.findOne({
      where: { name: UserRole.ADMIN }
    });

    if (!adminRole) {
      throw new BadRequestException('Admin role not found');
    }

    // Create user account
    const user = this.userRepository.create({
      firstName: registerCorporateDto.legalRepresentative.split(' ')[0] || 'Corporate',
      lastName: registerCorporateDto.legalRepresentative.split(' ').slice(1).join(' ') || 'User',
      email: registerCorporateDto.email,
      password: registerCorporateDto.password,
      phoneNumber: registerCorporateDto.phone,
      country: registerCorporateDto.country,
      countryCode: 'US', // Default, can be enhanced
      dialCode: '+1', // Default, can be enhanced
      roleId: adminRole.id,
    });

    const savedUser = await this.userRepository.save(user);

    // Create corporate account
    const corporate = this.corporateRepository.create({
      ...registerCorporateDto,
      userId: savedUser.id,
    });

    const savedCorporate = await this.corporateRepository.save(corporate);

    // Send verification email
    await this.sendVerificationEmail(savedCorporate.email, savedCorporate.id);

    return {
      message: 'Corporate registration successful. Please check your email for verification.',
      corporateId: savedCorporate.id
    };
  }

  async verifyEmail(corporateId: number, code: string): Promise<{ message: string }> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { 
        email: (await this.corporateRepository.findOne({ where: { id: corporateId } }))?.email,
        code,
        isUsed: false,
        expiresAt: new Date()
      }
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark verification code as used
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);

    // Update corporate email verification status
    const corporate = await this.corporateRepository.findOne({
      where: { id: corporateId },
      relations: ['user']
    });

    if (!corporate) {
      throw new NotFoundException('Corporate not found');
    }

    corporate.isEmailVerified = true;
    corporate.user.isEmailVerified = true;
    
    await this.corporateRepository.save(corporate);
    await this.userRepository.save(corporate.user);

    return { message: 'Email verified successfully' };
  }

  async findAll(): Promise<Corporate[]> {
    return await this.corporateRepository.find({
      relations: ['user', 'activityType', 'branches'],
      where: { isActive: true }
    });
  }

  async findOne(id: number): Promise<Corporate> {
    const corporate = await this.corporateRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'activityType', 'branches', 'activities']
    });

    if (!corporate) {
      throw new NotFoundException(`Corporate with ID ${id} not found`);
    }

    return corporate;
  }

  async findByUserId(userId: number): Promise<Corporate> {
    const corporate = await this.corporateRepository.findOne({
      where: { userId, isActive: true },
      relations: ['user', 'activityType', 'branches', 'activities']
    });

    if (!corporate) {
      throw new NotFoundException(`Corporate for user ID ${userId} not found`);
    }

    return corporate;
  }

  async update(id: number, updateCorporateDto: Partial<RegisterCorporateDto>): Promise<Corporate> {
    const corporate = await this.findOne(id);
    Object.assign(corporate, updateCorporateDto);
    return await this.corporateRepository.save(corporate);
  }

  async remove(id: number): Promise<void> {
    const corporate = await this.findOne(id);
    corporate.isActive = false;
    corporate.user.isActive = false;
    
    await this.corporateRepository.save(corporate);
    await this.userRepository.save(corporate.user);
  }

  async createBranch(corporateId: number, branchData: Partial<Branch>): Promise<Branch> {
    const corporate = await this.findOne(corporateId);
    
    const branch = this.branchRepository.create({
      ...branchData,
      corporateId: corporate.id
    });

    return await this.branchRepository.save(branch);
  }

  async getBranches(corporateId: number): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { corporateId, isActive: true }
    });
  }

  private async sendVerificationEmail(email: string, corporateId: number): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const verificationCode = this.verificationCodeRepository.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    await this.verificationCodeRepository.save(verificationCode);

    await this.emailService.sendVerificationEmail(email, code);
  }
} 