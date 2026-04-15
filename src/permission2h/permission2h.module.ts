import { Module } from '@nestjs/common';
import { Permission2hService } from './permission2h.service';
import { Permission2hController } from './permission2h.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission2h } from './entities/permission2h.entity';
import { Employee } from 'src/employee/entities/employee.entity';
// import { Payroll } from 'src/payroll/entities/payroll.entity';
// import { PayrollService } from 'src/payroll/payroll.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: "smtp.office365.com", // e.g., Gmail, Mailtrap
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_ADRESS'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_ADRESS')}>`,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      Permission2h,
      Employee,
      // Payroll,
      User
    ]),
  ],
  controllers: [Permission2hController],
  providers: [
    Permission2hService,
    // PayrollService,
    UserService,
    JwtService
  ],
})
export class Permission2hModule { }
