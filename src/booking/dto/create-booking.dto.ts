import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsOptional()
  userId: string;
}
