import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'The phone number must have 10 digits' })
  telephone?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @ValidateIf((o) => !o.email && !o.telephone)
  @IsString()
  @Matches(/.*/, { message: 'Either email or telephone must be provided' })
  _?: string;
}
