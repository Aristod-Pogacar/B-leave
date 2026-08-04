import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';

@Entity('employee_history')
export class EmployeeHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    departement!: string;

    @Column()
    section!: string;

    @Column()
    line!: string;

    @Column()
    matricule!: string;

    @Column({ type: 'date' })
    DOE!: Date;

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

    @Column({ type: 'date', nullable: true })
    DOR?: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @ManyToOne(() => Employee, employee => employee.histories, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'employee_id' })
    employee!: Employee;
}
