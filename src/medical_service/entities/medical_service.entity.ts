import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedicalService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

}
