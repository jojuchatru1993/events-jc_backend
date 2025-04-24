import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { formatInTimeZone } from 'date-fns-tz';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidRoles } from './interfaces/valid-roles.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto) {
    const { email, telephone, password } = loginDto;

    let user: User | null = null;
    if (email) {
      user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password'],
      });
    } else if (telephone) {
      user = await this.userRepository.findOne({
        where: { telephone },
        select: ['id', 'email', 'password'],
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bogotaTime = formatInTimeZone(
      new Date(Date.now() + 5 * 60 * 1000),
      'America/Bogota',
      'yyyy-MM-dd HH:mm:ssXXX',
    );

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '5m' });
    user.resetTokenUsed = false;
    user.resetTokenExpires = new Date(bogotaTime);
    await this.userRepository.save(user);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(email, token);
  }

  async validateResetToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) throw new NotFoundException('User not found');

      if (user.resetTokenUsed)
        throw new UnauthorizedException('The token has already been used');

      if (
        user.resetTokenExpires &&
        user.resetTokenExpires <
          new Date(
            formatInTimeZone(
              new Date(),
              'America/Bogota',
              'yyyy-MM-dd HH:mm:ssXXX',
            ),
          )
      ) {
        throw new UnauthorizedException('The token has expired');
      }

      return { valid: true, user };
    } catch (error) {
      throw this.handleTokenError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { user } = await this.validateResetToken(token);

    user.password = newPassword;
    user.resetTokenUsed = true;

    await this.userRepository.save(user);
  }

  private handleTokenError(error: any): UnauthorizedException {
    if (error.name === 'TokenExpiredError') {
      return new UnauthorizedException(
        'The token has expired. Please request a new link',
      );
    }
    if (error.name === 'JsonWebTokenError') {
      return new UnauthorizedException(
        'The token is invalid. Please check the link',
      );
    }
    return new UnauthorizedException('Error validating the token');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException(
          'The email or telephone is already registered',
        );
      }
      throw new UnauthorizedException(
        'Error creating the user. Please contact the administrator',
      );
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();

    return users;
  }

  async findOne(id: string, user?: User): Promise<User> {
    if (
      user &&
      user.roles.includes(ValidRoles.CLIENT) &&
      !user.roles.includes(ValidRoles.ADMIN) &&
      user.id !== id
    ) {
      throw new ForbiddenException(
        'You do not have permission to view the information of other users',
      );
    }

    const foundUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    user?: User,
  ): Promise<User> {
    if (
      user &&
      user.roles.includes(ValidRoles.CLIENT) &&
      !user.roles.includes(ValidRoles.ADMIN) &&
      user.id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar la información de otros usuarios',
      );
    }

    const foundUser = await this.findOne(id, user);
    return await this.userRepository.save({ ...foundUser, ...updateUserDto });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.softDelete(id);
  }
}
