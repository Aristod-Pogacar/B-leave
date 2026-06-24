import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

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

    @Column()
    matricule: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.PAYROLL
    })
    role: UserRole;

    @Column({ nullable: true })
    verificationCode: string;

    @Column({ type: 'enum', enum: Site, default: Site.ABE1 })
    site: Site;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
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

    @OneToMany(() => Employee, employee => employee.manager)
    employees: Employee[];

    @OneToMany(() => Leave, leave => leave.approver)
    leaves: Leave[];

    @ManyToOne(() => User, user => user.subordinates, {
        nullable: true
    })
    approver: User;

    @OneToMany(() => User, user => user.approver)
    subordinates: User[];
}