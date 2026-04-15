import { Module } from '@nestjs/common';
import { SmiaOstieService } from './smia_ostie.service';
import { SmiaOstieController } from './smia_ostie.controller';
import { Employee } from 'src/employee/entities/employee.entity';
import { SmiaOstie } from './entities/smia_ostie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';

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
    TypeOrmModule.forFeature([SmiaOstie, Employee, History]),
  ],
  controllers: [SmiaOstieController],
  providers: [SmiaOstieService, HistoryService],
  exports: [SmiaOstieService, HistoryService],
})
export class SmiaOstieModule { }
