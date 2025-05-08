import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Student } from './Student';

@Entity('health_checkups')
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number; // 키 (cm)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // 몸무게 (kg)
  
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi: number; // BMI (kg/m²)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  waistCircumference: number; // 허리둘레 (cm)

  @Column({ type: 'integer' })
  systolicPressure: number; // 혈압(수축기) (mmHg)

  @Column({ type: 'integer' })
  diastolicPressure: number; // 혈압(이완기) (mmHg)

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  leftEyesight: number; // 시력(좌)

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rightEyesight: number; // 시력(우)

  @Column({ type: 'date' })
  checkupDate: Date; // 검진일자

  @Column()
  studentId: number;

  @ManyToOne('Student', 'healthCheckups')
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 