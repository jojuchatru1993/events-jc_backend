import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../event/entities/event.entity';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBookingDto: CreateBookingDto, currentUser: User): Promise<Booking> {
    if (
      currentUser.roles.includes(ValidRoles.CLIENT) &&
      !currentUser.roles.includes(ValidRoles.ADMIN)
    ) {
      createBookingDto.userId = currentUser.id;
    }

    const { eventId, userId } = createBookingDto;

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['bookings'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const bookingsCount = event.bookings ? event.bookings.length : 0;
    if (bookingsCount >= event.capacity) {
      throw new BadRequestException('The event is full. Maximum capacity reached');
    }

    let user: User = currentUser;
    
    if (userId) {
      const foundUser = await this.userRepository.findOne({ where: { id: userId } });
      if (!foundUser) {
        throw new NotFoundException('User not found');
      }
      user = foundUser;
    } else if (currentUser.roles.includes(ValidRoles.ADMIN)) {
      user = currentUser;
    }

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: user.id }
      }
    });

    if (existingBooking) {
      throw new ForbiddenException('The user already has a reservation for this event');
    }

    const booking = this.bookingRepository.create({
      event,
      user,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ 
      where: { id },
      relations: ['event', 'user'] 
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (updateBookingDto.eventId) {
      const event = await this.eventRepository.findOne({
        where: { id: updateBookingDto.eventId },
        relations: ['bookings'],
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      
      if (booking.event.id !== event.id) {
        const bookingsCount = event.bookings ? event.bookings.length : 0;
        if (bookingsCount >= event.capacity) {
          throw new BadRequestException('The event is full. Maximum capacity reached');
        }
      }
      
      booking.event = event;
    }

    if (updateBookingDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateBookingDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      booking.user = user;
    }

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const userId = 
      currentUser.roles.includes(ValidRoles.CLIENT) &&
      !currentUser.roles.includes(ValidRoles.ADMIN)
        ? currentUser.id 
        : undefined;
    
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: userId ? ['user'] : [],
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    if (userId && booking.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this booking',
      );
    }
    
    await this.bookingRepository.delete(id);
  }

  async removeByUserAndEvent(userId: string, eventId: string, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId }
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.bookingRepository.delete(booking.id);
  }
}
