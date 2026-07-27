import { Employee } from 'src/employee/entities/employee.entity';
import { User } from 'src/user/entities/user.entity';
import { Withdraw } from 'src/withdraw/entities/withdraw.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
}

export enum WithdrawStatus {
    WITHDRAW_PENDING = 'withdraw_pending',
    WITHDRAW_APPROVED = 'withdraw_approved',
    WITHDRAW_CANCELLED = 'withdraw_cancelled',
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

    @Column({ default: false })
    imported: boolean;

    @Column({ nullable: true, default: null })
    withdraw_status: WithdrawStatus;

    @Column({ default: false })
    onehr_status: boolean;

    @Column({ nullable: true })
    reason?: string;

    @Column({ type: 'timestamp', nullable: true })
    approved_date?: Date;

    @ManyToOne(() => User, user => user.leaves)
    @JoinColumn({ name: 'approver_id' })
    approver?: User;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

    @OneToMany(() => Withdraw, withdraw => withdraw.leave)
    withdraw_Request: Withdraw[];
}
