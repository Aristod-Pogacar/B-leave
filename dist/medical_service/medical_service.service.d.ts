import { CreateMedicalServiceDto } from './dto/create-medical_service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical_service.dto';
import { MedicalService } from './entities/medical_service.entity';
import { Repository } from 'typeorm';
export declare class MedicalServiceService {
    private readonly medicalServiceRepo;
    constructor(medicalServiceRepo: Repository<MedicalService>);
    findOneByName(name: string): Promise<MedicalService | null>;
    create(createMedicalServiceDto: CreateMedicalServiceDto): Promise<CreateMedicalServiceDto & MedicalService>;
    findAll(): Promise<MedicalService[]>;
    findOne(id: string): Promise<MedicalService | null>;
    update(id: string, updateMedicalServiceDto: UpdateMedicalServiceDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    paginateMedicalService(search: string, page: number, limit: number): Promise<{
        data: MedicalService[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
}
