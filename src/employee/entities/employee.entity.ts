import { Leave } from 'src/leave/entities/leave.entity';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';

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

    @Column()
    pay_mode!: string;

    @Column({ type: 'date' })
    DOE!: Date;

    @Column({ type: 'date' })
    DOC!: Date;

    @Column({ type: 'date', nullable: true })
    DOR!: Date | null;

    @Column({ type: 'date' })
    effective_start_date!: Date;

    @Column({ type: 'date', nullable: true })
    effective_end_date!: Date | null;

    @Column()
    division!: string;

    @Column()
    div!: string;

    @Column()
    fullname!: string;

    @Column()
    job_level!: string;

    @Column()
    job_post!: string;

    @Column()
    occupation!: string;

    @Column()
    prtr!: string;

    @Column()
    DI!: string;

    @Column()
    site!: string;

    @Column()
    pattern!: string;

    @Column({ type: 'date' })
    date_of_birth!: Date;

    @Column()
    CIN!: string;

    @Column()
    CNAPS!: string;

    @Column()
    adrs_street!: string;

    @Column()
    adrs_locality!: string;

    @Column()
    adrs_twnvge!: string;

    @Column()
    cat_basic!: string;

    @Column()
    cat_ind!: string;

    @Column()
    cat_prof!: string;

    @Column()
    type!: string;

    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ default: true })
    is_active!: boolean;

    @OneToMany(() => Leave, leave => leave.employee)
    leaves: Leave[];

    @OneToMany(() => Permission2h, permission2h => permission2h.employee)
    permission2h: Permission2h[];

    @OneToMany(() => SmiaOstie, smia_ostie => smia_ostie.employee)
    smia_ostie: SmiaOstie[];

    @Index()
    @ManyToOne(() => User, user => user.employees, { nullable: true })
    @JoinColumn({ name: 'manager_id' })
    manager: User;

    @Column()
    app_password!: string;

    @Column()
    onehr_password!: string;
}