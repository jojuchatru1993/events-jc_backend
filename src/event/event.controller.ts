import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { User } from '../auth/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { OptionalAuth, OptionalUser } from '../auth/decorators/optional-auth.decorator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Auth(ValidRoles.ADMIN)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @OptionalAuth()
  @Get()
  findAll(@OptionalUser() user?: User) {
    return this.eventService.findAll(user?.id);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.CLIENT)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.eventService.findOne(id, user);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
