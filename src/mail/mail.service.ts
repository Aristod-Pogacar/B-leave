import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    async sendVerificationEmail(email: string, code: string) {

        await this.transporter.sendMail({
            from: '"DP-AQUARABE" <stagedp@aquarabe.mg>',
            to: email,
            subject: 'Code de vérification',
            html: `<h2>Votre code de vérification: ${code}</h2>`
        });
    }
}
