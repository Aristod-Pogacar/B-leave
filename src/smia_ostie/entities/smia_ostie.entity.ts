import { Employee } from "../../employee/entities/employee.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('smia_ostie')
export class SmiaOstie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    date_at: Date;

    @Column({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    date: Date;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    reason: string;

    @Column({
        type: 'varchar',
        nullable: true,
        default: 'normal',
    })
    status: string;

    @ManyToOne(() => Employee, (employee) => employee.smia_ostie, { eager: true })
    @JoinColumn({ name: 'employee_matricule', referencedColumnName: 'matricule' })
    employee: Employee;

}
