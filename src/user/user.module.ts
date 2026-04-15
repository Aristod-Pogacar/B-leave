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
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Leave, History])],
  controllers: [UserController],
  providers: [UserService, AuthService, MailService, JwtService, HistoryService],
  exports: [UserService, AuthService, MailService, JwtService, TypeOrmModule, HistoryService],
})
export class UserModule { }
