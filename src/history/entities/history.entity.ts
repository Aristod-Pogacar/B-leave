import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum HistoryReason {
    LEAVE = 'Leave',
    PERMISSION_2H = 'Permission 2h',
    CONSULTATION_MEDICAL = 'Consultation medicale',
    MEDICAL_SERVICE = 'Medical service',
    EMPLOYEE = 'Employee',
    MANAGER = 'Manager',
    USER = 'User',
    HOLIDAY = 'Holiday',
    WITHDRAW = 'Withdraw',
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

    @Column({ nullable: true })
    created_by?: string;

}
