import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TypingIndicatorDto {
  @ApiProperty()
  @IsUUID()
  conversationId: string;
}
