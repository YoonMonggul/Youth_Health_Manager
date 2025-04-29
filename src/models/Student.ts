import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StudentTeacherRelation } from './StudentTeacherRelation';
import { Growth } from './Growth';
import { Health } from './health';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: ['male', 'female']
  })
  gender: 'male' | 'female';

  @Column({
    type: 'enum',
    enum: ['elementary', 'middle', 'high']
  })
  schoolType: 'elementary' | 'middle' | 'high';

  @Column({ length: 100 })
  schoolName: string;

  @Column()
  grade: number; // 학년

  @Column()
  classNumber: number; // 반

  @Column()
  studentNumber: number; // 번호

  @Column({ length: 255, nullable: true })
  address: string; // 학생 주소

  @Column({ length: 100, nullable: true })
  parentName: string; // 보호자 이름

  @Column({
    type: 'enum',
    enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'],
    nullable: true
  })
  parentRelation: 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'other'; // 보호자 관계

  @Column({ length: 20, nullable: true })
  parentContact: string; // 보호자 연락처

  @Column({ type: 'text', nullable: true })
  note: string; // 특이사항

  @Column({ default: true })
  isActive: boolean; // 현재 재학 중 여부

  // 교사와의 관계 (다대다 관계를 위한 관계 테이블 사용)
  @OneToMany(() => StudentTeacherRelation, relation => relation.student)
  teacherRelations: StudentTeacherRelation[];

  // 성장 데이터와의 관계
  @OneToMany(() => Growth, growth => growth.student)
  growths: Growth[];

  // 건강검진 데이터와의 관계
  @OneToMany(() => Health, (health: Health) => health.student)
  healthCheckups: Health[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 