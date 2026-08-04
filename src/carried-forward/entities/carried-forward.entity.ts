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

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}
