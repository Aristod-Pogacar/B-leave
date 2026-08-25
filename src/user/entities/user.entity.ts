import { Employee } from '../../employee/entities/employee.entity';
import { Leave } from '../../leave/entities/leave.entity';
import { ManagerAssignation } from '../../manager_assignation/entities/manager_assignation.entity';
import { Withdraw } from '../../withdraw/entities/withdraw.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    // USER = 'USER',
    ADMIN = 'ADMIN',
    // HR_ADMIN = 'HR_ADMIN',
    HR_LEAD = 'HR_LEAD',
    // HEAD_HR = 'HEAD_HR',
    MANAGER = 'MANAGER',
    PAYROLL = 'PAYROLL',
    SUPERADMIN = 'SUPERADMIN'
}

export enum Site {
    ABE1 = 'ABE 1',
    ABE2 = 'ABE 2',
    ANTSIRABE = 'ANTSIRABE',
    TANA = 'TANA',
    MADA = 'MADA',
}

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @Column()
    // matricule: string;

    // @Column()
    // name: string;

    // @Column({ nullable: true })
    // firstName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.PAYROLL
    })
    role: UserRole;

    // @Column({ nullable: true })
    // verificationCode: string;

    @Column({ type: 'enum', enum: Site, default: Site.ABE1 })
    site: Site;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", nullable: true })
    // deletedAt: Date;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ default: false })
    isBlocked: boolean;

    @Column({ default: false })
    isSuspended: boolean;

    @Column({ default: false })
    isArchived: boolean;

    // @OneToMany(() => Employee, employee => employee.manager)
    // employees: Employee[];

    @OneToMany(() => Leave, leave => leave.approver)
    leaves: Leave[];

    @OneToMany(() => Withdraw, withdraw => withdraw.approver)
    withdrawn: Withdraw[];

    // @ManyToOne(() => User, user => user.subordinates, {
    //     nullable: true
    // })
    // approver: User;
    @OneToOne(() => Employee, employee => employee.user, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employee_id' })
    employee?: Employee | null;
}