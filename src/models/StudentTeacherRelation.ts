import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
// Student 클래스를 타입으로만 import하여 순환 참조 문제 해결
import type { Student } from './Student';

/**
 * 교사-학생 간 관계 정의
 * - homeroom: 담임 (담임교사-학생 관계)
 * - health: 보건 (보건교사-학생 관계)
 * - subject: 교과 (교과교사-학생 관계, 필요시 사용)
 */
export type RelationType = 'homeroom' | 'health' | 'subject' | 'administrative';

@Entity('student_teacher_relations')
export class StudentTeacherRelation {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  studentId: number;
  
  @Column()
  teacherId: number;
  
  @Column({
    type: 'enum',
    enum: ['homeroom', 'health', 'subject', 'administrative'],
    default: 'homeroom'
  })
  relationType: RelationType;
  
  @Column({ nullable: true })
  schoolYear: number;

  @Column({ nullable: true })
  semester: number; // 학기

  @Column({ nullable: true, length: 100 })
  subjectName: string; // 과목명 (과목 담당교사인 경우)

  // 생성 및 수정 시간
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @ManyToOne('Student', 'teacherRelations')
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ default: true })
  isActive: boolean;
} 