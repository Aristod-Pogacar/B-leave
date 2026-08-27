import { ConfigService } from '@nestjs/config';
import { Employee } from '../employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { CreateSmiaOstieDto } from './dto/create-smia_ostie.dto';
import { UpdateSmiaOstieDto } from './dto/update-smia_ostie.dto';
import { SmiaOstie } from './entities/smia_ostie.entity';
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { HistoryService } from '../history/history.service';
export declare class SmiaOstieService {
    private readonly config;
    private readonly SmiaOstieRepo;
    private readonly employeeRepo;
    private readonly configService;
    private readonly mailerService;
    private readonly historyService;
    constructor(config: ConfigService, SmiaOstieRepo: Repository<SmiaOstie>, employeeRepo: Repository<Employee>, configService: ConfigService, mailerService: MailerService, historyService: HistoryService);
    getManagerConsultations(managerId: string): Promise<SmiaOstie[]>;
    private getWeekRange;
    private getAllowedSites;
    toExport(search: string, user: any, startDate?: string, endDate?: string): Promise<SmiaOstie[]>;
    paginateMedicalService(search: string, page: number, limit: number, user: any, startDate?: string, endDate?: string): Promise<{
        data: SmiaOstie[];
        total: number;
        totalPages: number;
    }>;
    countByDayForCurrentWeek(site: string): Promise<number[]>;
    create(createSmiaOstieDto: CreateSmiaOstieDto): Promise<SmiaOstie | {
        status: string;
        message: string;
    }>;
    findAll(): Promise<SmiaOstie[]>;
    findOne(id: string): Promise<SmiaOstie | null>;
    update(id: string, updateSmiaOstieDto: UpdateSmiaOstieDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    findByDateDoingToday(): Promise<SmiaOstie[]>;
    paginateToday(page: number, limit: number): Promise<{
        data: SmiaOstie[];
        total: number;
        totalPages: number;
    }>;
    paginateHistory(date: string, search: string, page: number, limit: number): Promise<{
        data: SmiaOstie[];
        total: number;
        totalPages: number;
    }>;
    findByDate(date: Date): Promise<SmiaOstie[]>;
    countToday(): Promise<number>;
    getSmiaOstie(startDate: string, endDate: string, site: string): Promise<SmiaOstie[]>;
    exportSmiaOstieToExcel(data: any[], res: Response, startDate: string, endDate: string): Promise<void>;
    getMedicalRateBySectionToday(): Promise<SectionMedicalStat[]>;
    getMedicalConsultationByManager(): Promise<any[]>;
}
export interface SectionMedicalStat {
    section: string;
    employees: number;
    consultation: number;
    pct: number;
}
