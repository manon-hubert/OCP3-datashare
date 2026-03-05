import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('file_history')
export class FileHistoryEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ nullable: true, type: 'int' })
  userId: number | null;

  @ApiProperty()
  @Column()
  originalName: string;

  @ApiProperty()
  @Column()
  mimeType: string;

  @ApiProperty()
  @CreateDateColumn()
  deletedAt: Date;
}
