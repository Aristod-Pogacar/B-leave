import { User } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    recipient: User;

    @Column()
    title: string;

    @Column({
        type: 'text'
    })
    message: string;

    @Column({
        default: false
    })
    isRead: boolean;

    @Column({
        nullable: true
    })
    url: string;

    @Column({
        nullable: true
    })
    icon: string;

    @CreateDateColumn()
    createdAt: Date;
}