import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Student } from './Student';

@Entity('growths')
export class Growth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number; // 키 (cm)

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number; // 몸무게 (kg)

  @Column('decimal', { precision: 4, scale: 1 })
  bmi: number; // BMI

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  waistCircumference: number; // 허리둘레 (cm)

  @Column({ type: 'date' })
  measurementDate: Date; // 측정일

  @Column({ type: 'text', nullable: true })
  note: string; // 특이사항

  @ManyToOne('Student', 'growths')
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 