import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Site, User, UserRole } from './entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepo.save({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async searchManager(site: any, search: string) {
    const allowedSites = this.getAllowedSites(site);
    console.log("ALLOWED SITES:", allowedSites);
    const result = await this.userRepo.find({
      where: [{ site: In(allowedSites), role: UserRole.MANAGER, name: Like(`%${search}%`) }, { site: In(allowedSites), role: UserRole.MANAGER, firstName: Like(`%${search}%`) }, { site: In(allowedSites), role: UserRole.MANAGER, matricule: Like(`%${search}%`) }],
      select: ['name', 'firstName', 'site', 'id', 'matricule']
    });
    console.log("RESULT:", result);
    return result;
  }

  private getAllowedSites(userSite: string): string[] {
    if (userSite === Site.MADA) {
      return [Site.ABE1, Site.ABE2, Site.TANA];
    } else if (userSite === Site.ANTSIRABE) {
      return [Site.ABE1, Site.ABE2];
    } else if (userSite === Site.TANA) {
      return [Site.TANA];
    } else if (userSite === Site.ABE1) {
      return [Site.ABE1];
    } else if (userSite === Site.ABE2) {
      return [Site.ABE2];
    } else {
      return [];
    }
  }

  async findAllManagers(site: any) {
    const allowedSites = this.getAllowedSites(site);
    return await this.userRepo.find({ where: { site: In(allowedSites), role: UserRole.MANAGER } });
  }

  async getAdminUser() {
    const user = this.userRepo.create({
      id: 'superadmin',
      matricule: 'SUPERADMIN',
      firstName: 'Super',
      name: 'Admin',
      phone: "-",
      email: process.env.SUPERADMIN_EMAIL,
      role: UserRole.SUPERADMIN,
      site: Site.MADA,
    })
    return user;
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async findOne(id: string) {
    return await this.userRepo.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepo.update(id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userRepo.delete(id);
  }

  async approveUser(userId: string) {

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    user.isActive = true;

    await this.userRepo.save(user);

    return { message: "User approved" };
  }
  async login(email: string, password: string) {

    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new UnauthorizedException();

    if (!user.isVerified)
      throw new ForbiddenException('Email not verified');

    if (!user.isActive)
      throw new ForbiddenException('Waiting admin approval');

    if (user.isBlocked || user.isSuspended || user.isArchived)
      throw new ForbiddenException('Account restricted');

    const payload = { sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
