import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('system_configs')
@Index(['key'], { unique: true })
@Index(['category', 'key'])
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column({ length: 50 })
  category: string; // api, cache, monitoring, security, etc.

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 50, default: 'string' })
  type: string; // string, number, boolean, json, array

  @Column({ default: false })
  encrypted: boolean;

  @Column({ default: true })
  editable: boolean;

  @Column({ default: false })
  required: boolean;

  @Column('text', { nullable: true })
  validation: string; // JSON schema or regex for validation

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  // Helper methods
  getParsedValue(): any {
    try {
      switch (this.type) {
        case 'number':
          return parseFloat(this.value);
        case 'boolean':
          return this.value === 'true';
        case 'json':
        case 'array':
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch (error) {
      return this.defaultValue ? this.getParsedDefaultValue() : null;
    }
  }

  getParsedDefaultValue(): any {
    try {
      switch (this.type) {
        case 'number':
          return parseFloat(this.defaultValue);
        case 'boolean':
          return this.defaultValue === 'true';
        case 'json':
        case 'array':
          return JSON.parse(this.defaultValue);
        default:
          return this.defaultValue;
      }
    } catch (error) {
      return null;
    }
  }

  setValue(value: any): void {
    switch (this.type) {
      case 'json':
      case 'array':
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  }
}