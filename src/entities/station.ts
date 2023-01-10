/* eslint-disable indent */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Station extends BaseEntity {
  @PrimaryColumn()
  stationId: string;

  @Column()
  name: string;

  @Column({ type: 'double' })
  latitude: number;

  @Column({ type: 'double' })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
}
