import { Leave } from "../../leave/entities/leave.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum WithdrawStatus {
    WITHDRAW_PENDING = 'withdraw_pending',
    WITHDRAW_APPROVED = 'withdraw_approved',
    WITHDRAW_REJECTED = 'withdraw_rejected',
}

@Entity()
export class Withdraw {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Leave, leave => leave.withdraw_Request, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'leave_id' })
    leave!: Leave;

    @Column({ default: WithdrawStatus.WITHDRAW_PENDING })
    status: WithdrawStatus;

    @Column({ default: false })
    onehr_status: boolean;

    @Column({ type: 'timestamp', nullable: true })
    approved_date?: Date;

    @ManyToOne(() => User, user => user.withdrawn, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'approver_id' })
    approver?: User;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

}
