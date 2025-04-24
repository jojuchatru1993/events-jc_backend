import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Auth(ValidRoles.ADMIN, ValidRoles.CLIENT)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingService.create(createBookingDto, user);
  }

  @Auth(ValidRoles.ADMIN)
  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Auth(ValidRoles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.CLIENT)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingService.remove(id, user);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.CLIENT)
  @Delete()
  removeByUserAndEvent(
    @Query('eventId') eventId: string,
    @GetUser() user: User
  ) {
    return this.bookingService.removeByUserAndEvent(user.id, eventId, user);
  }
}
