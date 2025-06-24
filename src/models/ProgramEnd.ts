import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 프로그램 종료 이력 엔티티
 * - 어떤 프로그램 인스턴스가 언제, 왜 종료됐는지 기록
 */
@Entity('program_ends')
export class ProgramEnd {
  @PrimaryGeneratedColumn()
  id: number;

  // 종료된 프로그램 인스턴스 원본 ID
  @Column({ type: 'int' })
  programStartId: number;

  // 프로그램 정의 ID
  @Column({ type: 'int' })
  programId: number;

  // 프로그램명(운영자 입력)
  @Column({ type: 'varchar', length: 100 })
  programName: string;

  // 운영기간
  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  // 운영상태
  @Column({ type: 'boolean' })
  isStarted: boolean;

  // 참여학생 정보(학생 ID 배열 또는 학생 정보 전체)
  @Column({ type: 'json', nullable: true })
  students: object; // 학생 ID 배열 또는 학생 정보 전체(JSON)

  // 종료 사유
  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  // 종료 처리 시각
  @CreateDateColumn()
  endedAt: Date;
} 