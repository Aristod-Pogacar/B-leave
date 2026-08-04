import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Employee } from "src/employee/entities/employee.entity";

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

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}
