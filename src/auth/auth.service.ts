import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site, User, UserRole } from '../user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) { }

    // async register(email: any, password: any, name: any, firstName: any, phone: any, role: any, res: any) {
    //     const existing = await this.userRepo.findOne({ where: { email } });

    //     if (existing) {
    //         return res.status(400).redirect('/auth/register?error=emailAlreadyExists');
    //     }

    //     const hashedPassword = await bcrypt.hash(password, 10);

    //     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    //     const user = this.userRepo.create({
    //         email,
    //         password: hashedPassword,
    //         name,
    //         firstName,
    //         phone,
    //         role,
    //         verificationCode,
    //     });

    //     await this.userRepo.save(user);

    //     await this.mailService.sendVerificationEmail(user.email, verificationCode);

    //     return res.status(200).redirect('/auth/login?message=checkYourEmailForVerificationCode');
    // }

    async getEmailOrMatricule(login: any) {
        if (
            login === process.env.SUPERADMIN_EMAIL
        ) {
            return {
                id: 'superadmin',
                matricule: 'SUPERADMIN',
                firstName: 'Super',
                name: 'Admin',
                email: process.env.SUPERADMIN_EMAIL,
                role: UserRole.SUPERADMIN,
                isSuperAdmin: true,
                site: Site.MADA,
            };
        }
        const user = await this.userRepo.findOne({
            where: [{ email: login, role: Not(UserRole.MANAGER) }, { employee: { matricule: login }, role: Not(UserRole.MANAGER) }]
        });
        return user;
    }

    async validateUser(email: string, password: string) {

        const isSuperAdmin = await bcrypt.compare(password, process.env.SUPERADMIN_PASSWORD);

        if (
            email === process.env.SUPERADMIN_EMAIL &&
            isSuperAdmin
        ) {
            return {
                id: 'superadmin',
                matricule: 'SUPERADMIN',
                firstName: 'Super',
                name: 'Admin',
                email: process.env.SUPERADMIN_EMAIL,
                role: UserRole.SUPERADMIN,
                isSuperAdmin: true,
                site: Site.MADA,
                employee: {
                    name: 'Admin',
                    firstname: 'Super',
                    matricule: 'SUPERADMIN',
                },
            };
        }

        const userLogin = email

        // 👇 Sinon vérification normale en base
        const user = await this.userRepo.findOne({
            where: [
                { email: userLogin },
                { phone: userLogin },
                { employee: { matricule: userLogin } }
            ], relations: ['employee']
        });

        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return user;
    }
}
