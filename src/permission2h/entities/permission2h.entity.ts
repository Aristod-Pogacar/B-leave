import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../../employee/entities/employee.entity";

@Entity()
export class Permission2h {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    reason: string;

    @Column({
        type: 'date',
        nullable: true,
    })
    date: Date;

    @Column({
        type: 'time',
    })
    expectedStartTime: string;

    @Column({
        type: 'time',
    })
    expectedEndTime: string;

    @Column({
        type: 'time',
        nullable: true,
    })
    startTime: string;

    @Column({
        type: 'time',
        nullable: true,
    })
    endTime: string;

    @ManyToOne(() => Employee, (employee) => employee.permission2h, { eager: true })
    @JoinColumn({ name: 'employee_matricule', referencedColumnName: 'matricule' })
    employee: Employee;
}
