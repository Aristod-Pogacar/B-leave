import { Employee } from 'src/employee/entities/employee.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

@Entity('leaves')
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Employee, employee => employee.leaves)
    @JoinColumn({ name: 'employee_id' })
    employee!: Employee;

    @Column()
    leave_type!: string;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date' })
    end_date!: Date;

    @Column()
    duration!: number;

    @Column({ default: LeaveStatus.PENDING })
    status: LeaveStatus;

    @Column({ nullable: true })
    reason?: string;

    @Column({ type: 'date', nullable: true })
    approved_date?: Date;

    @ManyToOne(() => User, user => user.leaves)
    @JoinColumn({ name: 'approver_id' })
    approver?: User;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;
}
