import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('files')
export class FileEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @Column({
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string) => parseInt(v) },
  })
  size: number;

  @ApiProperty()
  @Column({ unique: true })
  downloadToken: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
