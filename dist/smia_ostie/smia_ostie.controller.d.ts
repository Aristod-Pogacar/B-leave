import { SmiaOstieService } from './smia_ostie.service';
import { CreateSmiaOstieDto } from './dto/create-smia_ostie.dto';
import { UpdateSmiaOstieDto } from './dto/update-smia_ostie.dto';
export declare class SmiaOstieController {
    private readonly smiaOstieService;
    constructor(smiaOstieService: SmiaOstieService);
    getManagerMedicalServices(managerId: string): Promise<import("./entities/smia_ostie.entity").SmiaOstie[]>;
    export(res: any, req: any, search?: string, page?: number, startDate?: string, endDate?: string): Promise<void>;
    getMedicalService(req: any, search?: string, page?: number, startDate?: string, endDate?: string): Promise<{
        title: string;
        data: import("./entities/smia_ostie.entity").SmiaOstie[];
        search: string;
        startDate: string;
        endDate: string;
        total: number;
        totalPages: number;
        startPage: number;
        endPage: number;
        currentPage: number;
        user: any;
    }>;
    getAddMedicalService(req: any): Promise<{
        title: string;
        user: any;
    }>;
    add(res: any, createSmiaOstieDto: CreateSmiaOstieDto): Promise<void>;
    create(createSmiaOstieDto: CreateSmiaOstieDto): Promise<import("./entities/smia_ostie.entity").SmiaOstie | {
        status: string;
        message: string;
    }>;
    findAll(): Promise<import("./entities/smia_ostie.entity").SmiaOstie[]>;
    findByDateDoingToday(): Promise<import("./entities/smia_ostie.entity").SmiaOstie[]>;
    findByDate({ date }: {
        date: string;
    }): Promise<import("./entities/smia_ostie.entity").SmiaOstie[]>;
    findOne(id: string): Promise<import("./entities/smia_ostie.entity").SmiaOstie | null>;
    update(id: string, updateSmiaOstieDto: UpdateSmiaOstieDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    getWeeklyStats(site: string): Promise<number[]>;
}
