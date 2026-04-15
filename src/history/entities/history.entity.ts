import { Employee } from "src/employee/entities/employee.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum HistoryReason {
    LEAVE = 'Leave',
    PERMISSION_2H = 'Permission 2h',
    CONSULTATION_MEDICAL = 'Consultation medicale',
    MEDICAL_SERVICE = 'Medical service',
    EMPLOYEE = 'Employee',
    MANAGER = 'Manager',
    USER = 'User',
}

@Entity('history')
export class History {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    date_at: Date;

    @Column()
    reason: string;

    @Column()
    message: string;

}
