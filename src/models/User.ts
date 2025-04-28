import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'teacher', 'health_teacher'],
    default: 'teacher'
  })
  role: 'admin' | 'teacher' | 'health_teacher';

  @Column({
    type: 'enum',
    enum: ['elementary', 'middle', 'high']
  })
  schoolType: 'elementary' | 'middle' | 'high';

  @Column({ length: 100 })
  schoolName: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 