import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('holidays')
export class Holiday {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'date', unique: true })
    date: Date;
}