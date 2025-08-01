import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Program } from './program';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string; // 주차별 컨텐츠 제목 (예: "1주차 - 건강한 식습관")

  @Column({ type: 'int' })
  weekNumber: number; // 주차 번호 (1, 2, 3, ...)

  @Column({ length: 50, nullable: true })
  category: string; // 카테고리 (예: 질병예방, 영양교육, 운동교육 등)

  @Column({ 
    type: 'enum', 
    enum: ['general', 'program'], 
    default: 'general' 
  })
  contentType: 'general' | 'program'; // 컨텐츠 타입: 일반 컨텐츠 또는 프로그램용 컨텐츠

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'inactive'; // 컨텐츠 상태

  @Column({ type: 'int', nullable: true })
  programId: number; // 연결된 프로그램 ID (선택사항)

  @ManyToOne(() => Program, { nullable: true })
  @JoinColumn({ name: 'programId' })
  program: Program;

  // 주차별 3개 컨텐츠 아이템 (JSON 형태로 저장)
  @Column({ type: 'json' })
  contentItems: ContentItem[]; // 3개의 컨텐츠 아이템 배열

  @Column({ type: 'text', nullable: true })
  note: string; // 특이사항

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 컨텐츠 아이템 인터페이스 (3개 묶음 중 하나)
export interface ContentItem {
  id: number; // 아이템 순서 (1, 2, 3)
  title: string; // 아이템 제목
  description: string; // 아이템 설명 텍스트
  imageUrl: string; // 이미지 URL 또는 파일 경로
  imageAlt: string; // 이미지 대체 텍스트
} 