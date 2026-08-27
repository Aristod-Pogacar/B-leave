import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, Site, User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { HistoryService } from '../history/history.service';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private readonly historyService;
    constructor(userService: UserService, authService: AuthService, historyService: HistoryService);
    private getAllowedSitesForNewUsers;
    private enumAllowed;
    saveMyPassword(body: any, res: any, req: any): Promise<any>;
    connectAdminUser(req: any, res: any, body: any): Promise<any>;
    getLoginAdmin(res: any, body: any): Promise<any>;
    getAllManagers(req: any): Promise<User[]>;
    searchManager(req: any, search: string): Promise<User[]>;
    getList(req: any): Promise<{
        users: User[];
        title: string;
        userRole: typeof UserRole;
        site: typeof Site;
        allValues: Site[];
        allowedSites: string[];
        keys: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2" | undefined)[];
    }>;
    getNewUser(req: any): Promise<{
        title: string;
        userRole: typeof UserRole;
        sites: string[];
        allowedKeys: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2")[];
    }>;
    register(body: any, req: any, res: any): Promise<any>;
    deleteUser(id: string): Promise<{
        title: string;
        userRole: typeof UserRole;
        users: User | null;
    }>;
    deleteTheUser(id: string, res: any, req: any): Promise<any>;
    editUser(id: string, req: any): Promise<{
        title: string;
        userRole: typeof UserRole;
        users: User | null;
        site: string[];
    }>;
    editTheUser(id: string, updateUserDto: UpdateUserDto, res: any, req: any): Promise<any>;
    getMyProfile(req: any): Promise<{
        title: string;
        user: any;
    }>;
    editMyProfile(req: any): Promise<{
        title: string;
        user: any;
    }>;
    editMyPassword(req: any): Promise<{
        title: string;
        user: any;
    }>;
    saveMyProfile(updateUserDto: UpdateUserDto, res: any, req: any): Promise<any>;
    create(createUserDto: CreateUserDto): Promise<{
        password: any;
        employee: import("../employee/entities/employee.entity").Employee;
        site: Site;
        phone: string;
        email: string;
        confirmPassword: string;
        role: UserRole;
    } & User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
