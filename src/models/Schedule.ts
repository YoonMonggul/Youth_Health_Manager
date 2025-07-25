import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 일정(Schedule) 엔티티
 * - 사용자가 등록하는 일정 정보를 저장합니다.
 */
@Entity('schedules')
export class Schedule {
  /** 고유 ID (PK) */
  @PrimaryGeneratedColumn()
  id: number;

  /** 일정명 */
  @Column({ length: 100 })
  title: string;

  /** 시작일 (YYYY-MM-DD) */
  @Column({ type: 'date' })
  startDate: string;

  /** 종료일 (YYYY-MM-DD) */
  @Column({ type: 'date' })
  endDate: string;

  /** 메모 (선택) */
  @Column({ type: 'text', nullable: true })
  note?: string;

  /** 생성일 */
  @CreateDateColumn()
  createdAt: Date;

  /** 수정일 */
  @UpdateDateColumn()
  updatedAt: Date;
} 