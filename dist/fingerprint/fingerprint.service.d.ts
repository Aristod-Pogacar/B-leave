import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
export declare class FingerprintService {
    private employeeRepo;
    constructor(employeeRepo: Repository<Employee>);
    findById(id: string): Promise<Employee | null>;
    findByMatricule(matricule: string): Promise<Employee | null>;
    findByFingerprintId(fingerprintId: number): Promise<Employee | null>;
    getNextFreeSlot(): Promise<number>;
    saveFingerprintId(matricule: string, fingerprintId: number, deviceId: string): Promise<Employee | null>;
    clearFingerprintId(matricule: string): Promise<Employee | null>;
}
