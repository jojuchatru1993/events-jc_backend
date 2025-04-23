import { Booking } from '../../booking/entities/booking.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @Column({ length: 100 })
  title: string;

  @Column({ length: 1000 })
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ length: 100 })
  organizer: string;

  @Column({ length: 255 })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  sanitizeFields() {
    this.title = this.title.toLocaleUpperCase().trim();
    this.description = this.description.toLocaleUpperCase().trim();
    this.location = this.location.toLocaleUpperCase().trim();
  }
}
