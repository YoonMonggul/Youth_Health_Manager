import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProgramStart } from './ProgramStart';

export enum ProgramLogType {
  START = 'START',           // 프로그램 시작
  END = 'END',               // 프로그램 종료
  STUDENT_ADD = 'STUDENT_ADD',     // 학생 추가
  STUDENT_REMOVE = 'STUDENT_REMOVE', // 학생 제거
  NOTICE = 'NOTICE',         // 공지사항
  REMINDER = 'REMINDER',     // 독려 메시지
  CHECKUP = 'CHECKUP',       // 건강검진
  MEASUREMENT = 'MEASUREMENT', // 측정
  OTHER = 'OTHER'            // 기타
}

@Entity('program_logs')
export class ProgramLog {
  @PrimaryGeneratedColumn()
  id: number;

  // 어떤 프로그램 인스턴스에 대한 로그인지
  @ManyToOne(() => ProgramStart, { nullable: true })
  @JoinColumn({ name: 'programStartId' })
  programStart: ProgramStart;

  // 로그 타입
  @Column({
    type: 'enum',
    enum: ProgramLogType
  })
  logType: ProgramLogType;

  // 로그 제목
  @Column({ length: 200 })
  title: string;

  // 로그 내용
  @Column({ type: 'text' })
  content: string;

  // 관련 학생 ID (선택사항)
  @Column({ type: 'int', nullable: true })
  studentId: number;

  // 관련 학생 이름 (선택사항)
  @Column({ length: 100, nullable: true })
  studentName: string;

  // 추가 데이터 (JSON 형태로 저장)
  @Column({ type: 'json', nullable: true })
  additionalData: object;

  // 로그 생성 시각 (자동)
  @CreateDateColumn()
  createdAt: Date;

  // 로그 작성자 (선택사항)
  @Column({ length: 100, nullable: true })
  createdBy: string;
} 