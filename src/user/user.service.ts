import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Site, User, UserRole } from './entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly employeeService: EmployeeService,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const employee = await this.employeeService.findOne(createUserDto.employee);
    if (!employee) {
      throw new BadRequestException("Employee not found");
    }
    if (employee.user) {
      throw new BadRequestException("Employee already has a user");
    }
    const user = await this.userRepo.save({
      ...createUserDto,
      password: hashedPassword,
      employee,
      site: employee.site as Site
    });
    return user;
  }

  async searchManager(site: any, search: string) {
    const allowedSites = this.getAllowedSites(site);
    // console.log("ALLOWED SITES:", allowedSites);
    const result = await this.userRepo.find({
      where: [
        { employee: { site: In(allowedSites), name: Like(`%${search}%`) }, role: UserRole.MANAGER },
        { employee: { site: In(allowedSites), firstname: Like(`%${search}%`) }, role: UserRole.MANAGER },
        { employee: { site: In(allowedSites), matricule: Like(`%${search}%`) }, role: UserRole.MANAGER }
      ],
      select: ['id', 'employee', 'email', 'phone', 'role'],
      relations: ['employee']
    });
    // console.log("RESULT:", result);
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
    return await this.userRepo.find({ where: { employee: { site: In(allowedSites) }, role: UserRole.MANAGER } });
  }

  async getAdminUser(): Promise<User> {
    const employee = new Employee();
    employee.matricule = "superadmin";
    employee.firstname = "Super";
    employee.name = "Admin";
    employee.site = Site.MADA;

    const user = new User();
    user.id = "superadmin";
    user.phone = "-";
    user.email = process.env.SUPERADMIN_EMAIL!;
    user.role = UserRole.SUPERADMIN;
    user.employee = employee;
    user.site = Site.MADA;

    return user;
  }

  async findAll() {
    return await this.userRepo.find({ relations: ['employee'] });
  }

  async findOne(id: string) {
    return await this.userRepo.findOne({ where: { id }, relations: ['employee'] });
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

  async updatePassword(id: any, body: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    if (!user) {
      throw new BadRequestException("User not found");
    }
    const match = await bcrypt.compare(body.actualPassword, user.password);
    if (body.newPassword != body.confirmPassword) {
      throw new BadRequestException("New password and confirm password do not match");
    }
    if (!match) {
      throw new BadRequestException("Actual password do not match");
    }
    await this.userRepo.update(id, { password: hashedPassword });
    return user;
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

  async getUsersDashboardStats() {
    const users = await this.userRepo.find({
      where: {
        isDeleted: false
      },
      order: {
        createdAt: "DESC"
      },
      relations: ['employee']
    });

    const admins = users.filter(
      u =>
        u.role === UserRole.ADMIN ||
        u.role === UserRole.SUPERADMIN
    ).length;

    const hrManagers = users.filter(
      u => u.role === UserRole.HR_LEAD
    ).length;

    const managers = users.filter(
      u => u.role === UserRole.MANAGER
    ).length;

    const payrolls = users.filter(
      u => u.role === UserRole.PAYROLL
    ).length;

    return {
      users: users.slice(0, 5), // seulement les 5 premiers
      stats: {
        admins,
        hrManagers,
        managers,
        payrolls
      }
    };
  }

  async findOneByMatricule(matricule: string) {
    return this.userRepo.findOne({ where: { employee: { matricule } } });
  }

  async findUsersByRole(role: UserRole, site: Site) {
    return this.userRepo.find({ where: { role, employee: { site } }, relations: ['employee'] });
  }

  async save(user: User) {
    return this.userRepo.save(user);
  }

}
