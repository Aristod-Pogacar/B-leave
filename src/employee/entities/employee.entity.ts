import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index, OneToOne } from 'typeorm';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    departement!: string;

    @Column()
    section!: string;

    @Column()
    line!: string;

    @Column({ unique: true })
    matricule!: string;

    @Column()
    gender!: string;

    @Column({ type: 'date' })
    DOE!: Date;

    @Column({ type: 'date', nullable: true })
    DOR?: Date | null;

    @Column()
    division!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    firstname?: string;

    @Column()
    job_level!: string;

    @Column()
    job_post!: string;

    @Column()
    designation!: string;

    @Column()
    site!: string;

    @Column()
    type!: string;

    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ default: true })
    is_active!: boolean;

    @OneToMany(() => Leave, leave => leave.employee, { onDelete: 'NO ACTION' })
    leaves: Leave[];

    @OneToMany(() => Permission2h, permission2h => permission2h.employee, { onDelete: 'NO ACTION' })
    permission2h: Permission2h[];

    @OneToMany(() => SmiaOstie, smia_ostie => smia_ostie.employee, { onDelete: 'NO ACTION' })
    smia_ostie: SmiaOstie[];

    @Index()
    @ManyToOne(() => Employee, manager => manager.subordinates, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'manager_id' })
    manager?: Employee | null;

    @Column()
    app_password!: string;

    @Column()
    onehr_password!: string;

    @OneToMany(() => EmployeeHistory, employeeHistory => employeeHistory.employee, { onDelete: 'NO ACTION' })
    histories: EmployeeHistory[];

    @Column({ type: 'int', nullable: true, unique: true })
    fingerprintId?: number | null;

    @Column({ type: 'varchar', nullable: true })
    deviceId?: string | null;

    @OneToOne(() => User, user => user.employee, { nullable: true, onDelete: 'SET NULL' })
    user?: User;

    @OneToMany(() => Employee, employee => employee.manager)
    subordinates: Employee[];
}