import { Student } from "../models/Student";
import { User } from "../models/User";
import { StudentTeacherRelation } from "../models/StudentTeacherRelation";
import { AppDataSource } from "../database/data-source";

// 통계 관련 인터페이스
export interface SchoolStatistics {
  schoolType: string;
  total: { all: number; male: number; female: number };
  grades: { grade: number; total: number; male: number; female: number }[];
}

export class StudentService {
  private studentRepository = AppDataSource.getRepository(Student);
  private userRepository = AppDataSource.getRepository(User);
  private relationRepository = AppDataSource.getRepository(StudentTeacherRelation);

  /**
   * 교사가 특정 학생을 관리할 권한이 있는지 확인
   * @param teacherId 교사 ID
   * @param studentId 학생 ID
   * @returns 권한 여부
   */
  async canManageStudent(teacherId: number, studentId: number): Promise<boolean> {
    try {
      // 교사 정보 조회
      const teacher = await this.userRepository.findOneBy({ id: teacherId });
      if (!teacher) return false;

      // 보건교사는 모든 학생을 관리할 수 있음
      if (teacher.role === 'health_teacher') {
        return true;
      }

      // 담임교사는 자신의 학급 학생만 관리할 수 있음
      if (teacher.role === 'teacher') {
        // 현재 학년도 (실제 구현 시 적절히 가져와야 함)
        const currentYear = new Date().getFullYear();
        
        // 학생-교사 관계 조회
        const relation = await this.relationRepository.findOne({
          where: {
            teacherId,
            studentId,
            relationType: 'homeroom',
            schoolYear: currentYear
          }
        });

        return !!relation; // 관계가 존재하면 true
      }

      // 관리자는 모든 학생을 관리할 수 있음
      if (teacher.role === 'admin') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('권한 확인 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 특정 교사가 관리할 수 있는 모든 학생 조회
   * @param teacherId 교사 ID
   * @returns 학생 목록
   */
  async getStudentsByTeacher(teacherId: number): Promise<Student[]> {
    try {
      const teacher = await this.userRepository.findOneBy({ id: teacherId });
      if (!teacher) return [];

      // 관리자나 보건교사는 모든 학생 조회 가능
      if (teacher.role === 'admin' || teacher.role === 'health_teacher') {
        return this.studentRepository.find({
          where: { isActive: true },
          order: { grade: 'ASC', classNumber: 'ASC', studentNumber: 'ASC' }
        });
      }

      // 담임교사는 자신의 학급 학생만 조회 가능
      if (teacher.role === 'teacher') {
        const currentYear = new Date().getFullYear();
        
        // 교사가 담당하는 학생 관계 목록 조회
        const relations = await this.relationRepository.find({
          where: {
            teacherId,
            relationType: 'homeroom',
            schoolYear: currentYear
          },
          relations: ['student']
        });

        // 학생 ID 목록 추출
        const studentIds = relations.map(relation => relation.studentId);
        
        if (studentIds.length === 0) return [];

        // 학생 정보 조회
        return this.studentRepository.find({
          where: {
            id: { in: studentIds },
            isActive: true
          },
          order: { grade: 'ASC', classNumber: 'ASC', studentNumber: 'ASC' }
        });
      }

      return [];
    } catch (error) {
      console.error('학생 목록 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 모든 학생 목록 조회
   * @returns 모든 학생 목록
   */
  async getAllStudents(): Promise<Student[]> {
    try {
      return await this.studentRepository.find({
        order: {
          schoolType: 'ASC',
          grade: 'ASC',
          classNumber: 'ASC',
          studentNumber: 'ASC'
        }
      });
    } catch (error) {
      console.error('학생 목록 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 학교 유형별 학생 목록 조회
   * @param schoolType 학교 유형 (elementary, middle, high)
   * @returns 해당 학교 유형의 학생 목록
   */
  async getStudentsBySchoolType(schoolType: 'elementary' | 'middle' | 'high'): Promise<Student[]> {
    try {
      return await this.studentRepository.find({
        where: { schoolType },
        order: { grade: 'ASC', classNumber: 'ASC', studentNumber: 'ASC' }
      });
    } catch (error) {
      console.error('학교 유형별 학생 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 학년별 학생 목록 조회
   * @param grade 학년
   * @returns 해당 학년의 학생 목록
   */
  async getStudentsByGrade(grade: number): Promise<Student[]> {
    try {
      return await this.studentRepository.find({
        where: { grade },
        order: { schoolType: 'ASC', classNumber: 'ASC', studentNumber: 'ASC' }
      });
    } catch (error) {
      console.error('학년별 학생 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 학교 유형과 학년으로 학생 목록 조회
   * @param schoolType 학교 유형
   * @param grade 학년
   * @returns 해당 조건의 학생 목록
   */
  async getStudentsBySchoolTypeAndGrade(
    schoolType: 'elementary' | 'middle' | 'high',
    grade: number
  ): Promise<Student[]> {
    try {
      return await this.studentRepository.find({
        where: { schoolType, grade },
        order: { classNumber: 'ASC', studentNumber: 'ASC' }
      });
    } catch (error) {
      console.error('학교 유형 및 학년별 학생 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 학생 상세 정보 조회
   * @param id 학생 ID
   * @returns 학생 상세 정보
   */
  async getStudentById(id: number): Promise<Student | null> {
    try {
      return await this.studentRepository.findOne({
        where: { id },
        relations: ['teacherRelations', 'teacherRelations.teacher']
      });
    } catch (error) {
      console.error('학생 상세 정보 조회 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 새로운 학생 등록
   * @param studentData 학생 데이터
   * @returns 등록된 학생 정보
   */
  async createStudent(studentData: Partial<Student>): Promise<Student | null> {
    try {
      // 학생 ID 생성
      const studentId = `S${new Date().getFullYear().toString().slice(-2)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // 학생 객체 생성
      const student = this.studentRepository.create({
        ...studentData,
        studentId,
      });

      // 저장 및 반환
      return await this.studentRepository.save(student);
    } catch (error) {
      console.error('학생 등록 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 학생 정보 수정
   * @param id 학생 ID
   * @param studentData 수정할 학생 데이터
   * @returns 수정된 학생 정보
   */
  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | null> {
    try {
      // studentId는 수정 불가
      if (studentData.studentId) {
        delete studentData.studentId;
      }

      // 기존 학생 조회
      const student = await this.studentRepository.findOneBy({ id });
      if (!student) return null;

      // 학생 정보 업데이트
      Object.assign(student, studentData);
      
      // 저장 및 반환
      return await this.studentRepository.save(student);
    } catch (error) {
      console.error('학생 정보 수정 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 학생 삭제 (soft delete - isActive를 false로 설정)
   * @param id 학생 ID
   * @returns 성공 여부
   */
  async deleteStudent(id: number): Promise<boolean> {
    try {
      // 학생 조회
      const student = await this.studentRepository.findOneBy({ id });
      if (!student) return false;

      // 삭제 처리 (isActive 설정)
      student.isActive = false;
      await this.studentRepository.save(student);
      
      return true;
    } catch (error) {
      console.error('학생 삭제 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 학생 완전 삭제 (실제 DB에서 제거)
   * @param id 학생 ID
   * @returns 성공 여부
   */
  async hardDeleteStudent(id: number): Promise<boolean> {
    try {
      const result = await this.studentRepository.delete(id);
      return result.affected && result.affected > 0;
    } catch (error) {
      console.error('학생 완전 삭제 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 학생 통계 정보 계산
   * @param schoolType 학교 유형 필터 (선택적)
   * @returns 학생 통계 정보
   */
  async getStudentStatistics(schoolType?: 'elementary' | 'middle' | 'high'): Promise<SchoolStatistics> {
    try {
      // 학생 데이터 가져오기
      let students: Student[];
      if (schoolType) {
        students = await this.getStudentsBySchoolType(schoolType);
      } else {
        students = await this.getAllStudents();
      }

      // 통계 객체 초기화
      const stats: SchoolStatistics = {
        schoolType: schoolType || 'ALL',
        total: { all: 0, male: 0, female: 0 },
        grades: []
      };

      // 학년별 통계 초기화 (학교 유형에 따라 최대 학년이 다름)
      const maxGrade = schoolType === 'elementary' ? 6 : 3;
      stats.grades = Array.from({ length: maxGrade }, (_, i) => ({
        grade: i + 1,
        total: 0,
        male: 0,
        female: 0
      }));

      // 통계 계산
      for (const student of students) {
        // 전체 통계
        stats.total.all++;
        if (student.gender === 'male') stats.total.male++;
        if (student.gender === 'female') stats.total.female++;

        // 학년별 통계
        const gradeIndex = student.grade - 1;
        if (gradeIndex >= 0 && gradeIndex < stats.grades.length) {
          stats.grades[gradeIndex].total++;
          if (student.gender === 'male') stats.grades[gradeIndex].male++;
          if (student.gender === 'female') stats.grades[gradeIndex].female++;
        }
      }

      return stats;
    } catch (error) {
      console.error('학생 통계 계산 중 오류 발생:', error);
      // 오류 발생 시 빈 통계 반환
      return {
        schoolType: schoolType || 'ALL',
        total: { all: 0, male: 0, female: 0 },
        grades: []
      };
    }
  }
} 