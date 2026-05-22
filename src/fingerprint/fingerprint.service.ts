import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class FingerprintService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepo: Repository<Employee>,
    ) { }

    async findById(id: string): Promise<Employee | null> {
        return this.employeeRepo.findOne({ where: { id } });
    }

    async findByMatricule(matricule: string): Promise<Employee | null> {
        return this.employeeRepo.findOne({ where: { matricule } });
    }

    async findByFingerprintId(fingerprintId: number): Promise<Employee | null> {
        return this.employeeRepo.findOne({ where: { fingerprintId } });
    }

    // Prochain slot libre (1-162) en tenant compte des slots déjà en DB
    async getNextFreeSlot(): Promise<number> {
        const used = await this.employeeRepo.find({
            where: { fingerprintId: Not(IsNull()) },
            select: ['fingerprintId'],
        });
        const usedSlots = new Set(used.map(e => e.fingerprintId));
        for (let i = 1; i <= 162; i++) {
            if (!usedSlots.has(i)) return i;
        }
        throw new Error('Plus de slots disponibles dans le capteur');
    }

    async saveFingerprintId(
        matricule: string,
        fingerprintId: number,
        deviceId: string,
    ): Promise<Employee | null> {
        const employee = await this.employeeRepo.findOne({ where: { matricule: matricule } });
        if (!employee) return null;
        employee.fingerprintId = fingerprintId;
        employee.deviceId = deviceId;
        return this.employeeRepo.save(employee);
    }

    async clearFingerprintId(matricule: string): Promise<Employee | null> {
        const employee = await this.employeeRepo.findOne({ where: { matricule: matricule } });
        if (!employee) return null;
        employee.fingerprintId = null;
        employee.deviceId = null;
        return this.employeeRepo.save(employee);
    }
}