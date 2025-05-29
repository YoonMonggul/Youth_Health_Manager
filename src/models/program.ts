import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('programs')
export class Program {
  // 프로그램 고유 ID (PK)
  @PrimaryGeneratedColumn()
  id: number;

  // 프로그램명
  @Column({ length: 100 })
  name: string;

  // 프로그램 시작일
  @Column({ type: 'date' })
  startDate: Date;

  // 프로그램 종료일
  @Column({ type: 'date' })
  endDate: Date;

  // 프로그램 설명 (선택)
  @Column({ type: 'text', nullable: true })
  description: string;

  // 생성일시 (자동)
  @CreateDateColumn()
  createdAt: Date;

  // 수정일시 (자동)
  @UpdateDateColumn()
  updatedAt: Date;
} 