import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ nullable: true, type: 'int' })
  userId: number | null;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column({
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string) => parseInt(v) },
  })
  size: number;

  @Column({ unique: true })
  downloadToken: string;

  @CreateDateColumn()
  createdAt: Date;
}
