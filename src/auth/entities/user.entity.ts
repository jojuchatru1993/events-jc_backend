import { Exclude } from 'class-transformer';
import { ValidRoles } from '../../auth/interfaces/valid-roles.interface';
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
import * as bcrypt from 'bcrypt';
import { Booking } from '../../booking/entities/booking.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  telephone: string;

  @Column()
  address: string;

  @Column('text', {
    select: false,
  })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    array: true,
    default: [ValidRoles.CLIENT],
  })
  roles: ValidRoles[];

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column({ nullable: true })
  resetTokenUsed: boolean;

  @Column({ nullable: true })
  resetTokenExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  sanitizeFields() {
    this.email = this.email.toLowerCase().trim();
    this.firstName = this.firstName.toLocaleUpperCase().trim();
    this.lastName = this.lastName.toLocaleUpperCase().trim();
    this.address = this.address.toLocaleUpperCase().trim();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
