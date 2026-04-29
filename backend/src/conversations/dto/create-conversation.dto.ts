import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';

export class CreateConversationDto {
  @IsEnum(['DIRECT', 'GROUP'])
  type!: 'DIRECT' | 'GROUP';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(255)
  @IsString({ each: true })
  memberIds!: string[];
}
