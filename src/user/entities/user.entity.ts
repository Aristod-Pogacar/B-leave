import { Employee } from 'src/employee/entities/employee.entity';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
    // USER = 'USER',
    ADMIN = 'ADMIN',
    HR_ADMIN = 'HR_ADMIN',
    HEAD_HR = 'HEAD_HR',
    MANAGER = 'MANAGER',
    PAYROLL = 'PAYROLL',
    SUPERADMIN = 'SUPERADMIN'
}

export enum Site {
    ABE1 = 'RABE',
    ABE2 = 'LAG',
    ANTSIRABE = 'ANTSIRABE',
    TANA = 'TANA',
    MADA = 'ADMIN',
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
}