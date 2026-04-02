import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ManagerAssignation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @ManyToOne(() => Employee, employee => employee.managerAssignations)
    // @JoinColumn({ name: 'employee_id' })
    // employee!: Employee;

    // @ManyToOne(() => User, user => user.managerAssignations)
    // @JoinColumn({ name: 'manager_id' })
    // manager!: User;
}
