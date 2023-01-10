/* eslint-disable indent */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn()
  scheduleId: string;

  @Column()
  userId: number;

  @Column()
  chatId: number;

  @Column()
  alertedAt: Date;

  @Column()
  isAlerted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
