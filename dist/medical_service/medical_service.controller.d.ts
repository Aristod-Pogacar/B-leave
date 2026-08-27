import { MedicalServiceService } from './medical_service.service';
import { CreateMedicalServiceDto } from './dto/create-medical_service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical_service.dto';
import { HistoryService } from '../history/history.service';
export declare class MedicalServiceController {
    private readonly medicalServiceService;
    private readonly historyService;
    constructor(medicalServiceService: MedicalServiceService, historyService: HistoryService);
    getMedicalService(req: any, search?: string, page?: number): Promise<{
        title: string;
        data: import("./entities/medical_service.entity").MedicalService[];
        search: string;
        total: number;
        totalPages: number;
        startPage: number;
        endPage: number;
        currentPage: number;
    }>;
    getNewMedicalService(req: any): Promise<{
        title: string;
        user: any;
    }>;
    postNewMedicalService(req: any, body: CreateMedicalServiceDto, res: any): Promise<any>;
    getEditMedicalService(req: any, id: string): Promise<{
        title: string;
        user: any;
        data: import("./entities/medical_service.entity").MedicalService | null;
    }>;
    postEditMedicalService(req: any, id: string, body: UpdateMedicalServiceDto, res: any): Promise<any>;
    deleteMedicalService(req: any, id: string, res: any): Promise<any>;
    create(createMedicalServiceDto: CreateMedicalServiceDto): Promise<CreateMedicalServiceDto & import("./entities/medical_service.entity").MedicalService>;
    findAll(): Promise<import("./entities/medical_service.entity").MedicalService[]>;
    findOne(id: string): Promise<import("./entities/medical_service.entity").MedicalService | null>;
    update(id: string, updateMedicalServiceDto: UpdateMedicalServiceDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
