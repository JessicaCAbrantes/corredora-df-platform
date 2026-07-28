import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

export class ParticipantSnapshotInputDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  externalRegistrationCode!: string;
}

export class CreateKitPickupRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  kitPickupServiceId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  registrationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParticipantSnapshotInputDto)
  participant?: ParticipantSnapshotInputDto;
}
