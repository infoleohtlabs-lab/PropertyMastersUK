import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReactionDto {
  @ApiProperty()
  @IsUUID()
  messageId: string;

  @ApiProperty()
  @IsString()
  emoji: string;
}