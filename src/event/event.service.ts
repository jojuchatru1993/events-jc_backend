import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventWithBookingsDto } from './dto/event-with-bookings.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return await this.eventRepository.save(event);
  }

  async findAll(userId?: string): Promise<EventWithBookingsDto[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.bookings', 'booking')
      .select('event')
      .addSelect('COUNT(booking.id)', 'bookingsCount')
      .addSelect(
        `MAX(CASE WHEN booking.userId = :userId THEN 1 ELSE 0 END)`,
        'hasBooking',
      )
      .setParameter(
        'userId',
        userId || '00000000-0000-0000-0000-000000000000',
      )
      .groupBy('event.id')
      .getRawAndEntities();

    return events.entities.map((event, index) => this.mapToEventWithBookings(event, events.raw[index]));
  }

  async findOne(id: string, user?: User): Promise<EventWithBookingsDto> {
    const eventData = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.bookings', 'booking')
      .select('event')
      .addSelect('COUNT(booking.id)', 'bookingsCount')
      .addSelect(
        `MAX(CASE WHEN booking.userId = :userId THEN 1 ELSE 0 END)`,
        'hasBooking',
      )
      .setParameter(
        'userId',
        user?.id || '00000000-0000-0000-0000-000000000000',
      )
      .where('event.id = :id', { id })
      .groupBy('event.id')
      .getRawAndEntities();

    if (eventData.entities.length === 0) {
      throw new NotFoundException('Event not found');
    }

    return this.mapToEventWithBookings(eventData.entities[0], eventData.raw[0]);
  }

  private mapToEventWithBookings(event: Event, rawData: any): EventWithBookingsDto {
    return {
      ...event,
      bookingsCount: parseInt(rawData?.bookingsCount || '0'),
      hasBooking: Number(rawData?.hasBooking) === 1,
    } as EventWithBookingsDto;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const eventData = await this.eventRepository.findOne({ where: { id } });

    if (!eventData) {
      throw new NotFoundException('Event not found');
    }

    this.eventRepository.merge(eventData, updateEventDto);
    return await this.eventRepository.save(eventData);
  }

  async remove(id: string): Promise<void> {
    await this.eventRepository.softDelete(id);
  }
}
