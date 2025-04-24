import { Event } from '../entities/event.entity';

export interface EventWithBookingsDto extends Event {
  bookingsCount: number;
  hasBooking?: boolean;
} 