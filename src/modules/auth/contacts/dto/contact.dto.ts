import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

import { ContactSortFields, ContactSortValues } from '../enums/contact.enum';

export class GetContactDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  merchantId: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  phoneNumber: number;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  points: number;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  sales: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  tier: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  status: string;

  @ApiProperty()
  @Type(() => Date)
  createdAt: Date;
}

export class CreatContactDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  // @MinLength(9)
  // @MaxLength(15)
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;
}

export class MembershipTierDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  _id: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  membershipName: string;

  @ApiProperty()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  bahtSpent: number;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  points: number;

  @ApiProperty()
  @IsArray()
  @IsDefined()
  benefits: [string];

  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  pointThreshold: number;
}

export class UpdateUserMembershipTierDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  membershipTierId: string;
}

export class DuplicateContactDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  merchant: any;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty()
  @IsDefined()
  @IsNumberString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(15)
  phoneNumber: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class SearchContactReqDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(ContactSortFields, { each: true })
  sortField: ContactSortFields;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(ContactSortValues, { each: true })
  sortBy: ContactSortValues;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  limit: number;
}

export class GetListMergeSuggestionDto {
  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  limit: number;
}

export class MergeContactDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactSuggestionDto)
  suggestions: [ContactSuggestionDto];
}

class ContactSuggestionDto {
  @ApiPropertyOptional()
  @IsDefined()
  @IsString()
  resourceId: string;

  @ApiPropertyOptional()
  @IsDefined()
  @IsString()
  targetId: string;
}
