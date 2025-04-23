import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidRoles } from '../../auth/interfaces/valid-roles.interface';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  password: string;

  /*
  @IsArray()
  @IsEnum(ValidRoles, { each: true })
  @IsOptional()
  roles: ValidRoles[];
  */
}
