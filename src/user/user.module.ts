import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Leave])],
  controllers: [UserController],
  providers: [UserService, AuthService, MailService, JwtService],
  exports: [UserService, AuthService, MailService, JwtService, TypeOrmModule],
})
export class UserModule { }
