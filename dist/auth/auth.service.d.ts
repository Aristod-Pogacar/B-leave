import { Site, User, UserRole } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly userRepo;
    private readonly mailService;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, mailService: MailService, jwtService: JwtService);
    getEmailOrMatricule(login: any): Promise<User | {
        id: string;
        matricule: string;
        firstName: string;
        name: string;
        email: string | undefined;
        role: UserRole;
        isSuperAdmin: boolean;
        site: Site;
    } | null>;
    validateUser(email: string, password: string): Promise<User | {
        id: string;
        matricule: string;
        firstName: string;
        name: string;
        email: string;
        role: UserRole;
        isSuperAdmin: boolean;
        site: Site;
        employee: {
            name: string;
            firstname: string;
            matricule: string;
        };
    } | null>;
}
