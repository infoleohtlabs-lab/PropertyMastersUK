import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Updated message content',
    example: 'This is the updated message content',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Whether the message is marked as important',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @ApiProperty({
    description: 'Additional metadata for the message',
    example: { edited_reason: 'Fixed typo' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}