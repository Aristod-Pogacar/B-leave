import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Site, User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
export declare class UserService {
    private readonly userRepo;
    private readonly jwtService;
    private readonly employeeService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, employeeService: EmployeeService);
    create(createUserDto: CreateUserDto): Promise<{
        password: any;
        employee: Employee;
        site: Site;
        phone: string;
        email: string;
        confirmPassword: string;
        role: UserRole;
    } & User>;
    searchManager(site: any, search: string): Promise<User[]>;
    private getAllowedSites;
    findAllManagers(site: any): Promise<User[]>;
    getAdminUser(): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    approveUser(userId: string): Promise<{
        message: string;
    }>;
    updatePassword(id: any, body: any): Promise<User>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    getUsersDashboardStats(): Promise<{
        users: User[];
        stats: {
            admins: number;
            hrManagers: number;
            managers: number;
            payrolls: number;
        };
    }>;
    findOneByMatricule(matricule: string): Promise<User | null>;
    findPayrollUser(role: UserRole, site: string): Promise<User[]>;
    findUsersByRole(role: UserRole, site: Site): Promise<User[]>;
    save(user: User): Promise<User>;
}
