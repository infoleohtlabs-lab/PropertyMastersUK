import { ConfigService } from '@nestjs/config';

export function getTimestampType(): string {
  return 'datetime';
}

export function getDateType(): string {
  return 'date';
}

export function getTextType(): string {
  return 'text';
}

export function getJsonType(): string {
  return 'text';
}

export function getEnumType(): string {
  return 'varchar';
}

export function getEnumConfig(enumObject?: any): any {
  return undefined;
}
