import { Site, UserRole } from "../entities/user.entity";
export declare class CreateUserDto {
    employee: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    site: Site;
}
