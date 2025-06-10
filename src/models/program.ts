import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgramTrendType {
  BMI = 'BMI',
  WAIST = 'WAIST',
}

@Entity('programs')
export class Program {
  // 프로그램 고유 ID (PK)
  @PrimaryGeneratedColumn()
  id: number;

  // 프로그램명
  @Column({ length: 100 })
  name: string;

  // 프로그램 설명 (선택)
  @Column({ type: 'text', nullable: true })
  description: string;

  // 변화율 추이 그래프 기준 항목 (BMI 또는 허리둘레)
  @Column({
    type: 'enum',
    enum: ProgramTrendType,
    default: ProgramTrendType.BMI,
    comment: '프로그램별 변화율 추이 그래프 기준 (BMI 또는 허리둘레)'
  })
  trendType: ProgramTrendType;

  // 생성일시 (자동)
  @CreateDateColumn()
  createdAt: Date;

  // 수정일시 (자동)
  @UpdateDateColumn()
  updatedAt: Date;
} 