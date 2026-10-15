import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Employee } from "../../employee/entities/employee.entity";

@Entity()
export class CarriedForward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    days: number;

    @Column()
    daysTaken: number;

    @ManyToOne(() => Employee, (employee) => employee.carriedForwards)
    employee: Employee;

    @Column()
    date: Date;

    @CreateDateColumn({ type: 'datetime2' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime2' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'datetime2' })
    deletedAt: Date;
}
