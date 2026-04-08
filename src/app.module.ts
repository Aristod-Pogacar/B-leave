import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { ConfigModule } from '@nestjs/config';
import { Leave } from './leave/entities/leave.entity';
import { Employee } from './employee/entities/employee.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './user/entities/user.entity';
import { EmployeeService } from './employee/employee.service';
import { SessionLocalsMiddleware } from './session-locals/session-locals.middleware';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerController } from './puppeteer/puppeteer.controller';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { CryptoService } from './crypto/crypto.service';
import { PuppeteerManagerService } from './puppeteer-manager/puppeteer-manager.service';
import { ApiLeaveModule } from './api/leave/leave.module';
import { ManagerAssignationModule } from './manager_assignation/manager_assignation.module';
import path from 'path';
import { ManagerAssignation } from './manager_assignation/entities/manager_assignation.entity';
import { Permission2hModule } from './permission2h/permission2h.module';
import { Permission2h } from './permission2h/entities/permission2h.entity';
import { MedicalServiceModule } from './medical_service/medical_service.module';
import { MedicalService } from './medical_service/entities/medical_service.entity';
import { MedicalServiceService } from './medical_service/medical_service.service';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        // path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      // database: 'leave_planner_test',
      database: 'b_leave',
      entities: [
        Leave,
        Employee,
        User,
        ManagerAssignation,
        Permission2h,
        MedicalService
      ],
      synchronize: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'database.sqlite',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    EmployeeModule,
    LeaveModule,
    UserModule,
    AuthModule,
    PuppeteerModule,
    ApiLeaveModule,
    ManagerAssignationModule,
    Permission2hModule,
    MedicalServiceModule,
  ],
  controllers: [AppController, PuppeteerController],
  providers: [AppService, MailService, AuthService, JwtService, EmployeeService, PuppeteerService, CryptoService, PuppeteerManagerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionLocalsMiddleware)
      .forRoutes('*');
  }
}
