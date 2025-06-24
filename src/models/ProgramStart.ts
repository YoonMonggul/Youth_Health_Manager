import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Program } from './program';
import { Student } from './Student';

/**
 * 프로그램 운영 인스턴스(실제 운영되는 프로그램)를 관리하는 엔티티입니다.
 * - 프로그램 정의(Program)와 1:N 관계
 * - 여러 학생이 참여할 수 있음 (ManyToMany)
 * - 실제 운영(시작/종료/참여학생/운영상태 등) 정보를 관리
 */
@Entity('program_starts')
export class ProgramStart {
  /** 고유 ID (PK) */
  @PrimaryGeneratedColumn()
  id: number;

  /** 어떤 프로그램(정의)으로부터 시작된 운영 인스턴스인지 (외래키) */
  @ManyToOne(() => Program, { eager: true })
  program: Program;

  /** 프로그램 실제 시작일 (YYYY-MM-DD) */
  @Column({ type: 'date' })
  startDate: string;

  /** 프로그램 실제 종료일 (YYYY-MM-DD) */
  @Column({ type: 'date' })
  endDate: string;

  /** 프로그램이 실제로 시작되었는지 여부 (true: 시작, false: 대기/종료) */
  @Column({ type: 'boolean', default: false })
  isStarted: boolean;

  /** 이 프로그램에 참여하는 학생 목록 (다대다 관계) */
  @ManyToMany(() => Student, { eager: true })
  @JoinTable({
    name: 'program_start_students',
    joinColumn: { name: 'programStartId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' }
  })
  students: Student[];

  /** 프로그램 인스턴스 이름 (운영자가 직접 입력, 예: 1학년 1반 6월 비만 예방반) */
  @Column({ type: 'varchar', length: 100 })
  programName: string;

  /** 이 레코드가 생성된 시각 (자동) */
  @CreateDateColumn()
  createdAt: Date;

  /** 이 레코드가 마지막으로 수정된 시각 (자동) */
  @UpdateDateColumn()
  updatedAt: Date;
} 