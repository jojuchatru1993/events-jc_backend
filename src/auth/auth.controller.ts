import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query, ParseUUIDPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    if (!loginDto.email && !loginDto.telephone) {
      throw new BadRequestException('Email or telephone number is required');
    }
    return this.authService.login(loginDto);
  }

  @Post('request')
  async requestPasswordReset(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return {
      message: 'Password reset instructions have been sent to your email',
    };
  }

  @Post('reset')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been successfully reset' };
  }

  @Get('validate-token')
  async validateResetToken(@Query('token') token: string) {
    const validation = await this.authService.validateResetToken(token);
    return { valid: validation.valid };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  @Auth(
    ValidRoles.ADMIN,
    ValidRoles.CLIENT
  )
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    return this.authService.findOne(id, user);
  }

  @Patch(':id')
  @Auth(
    ValidRoles.ADMIN,
    ValidRoles.CLIENT
  )
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User
  ) {
    return this.authService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.remove(id);
  }
}
