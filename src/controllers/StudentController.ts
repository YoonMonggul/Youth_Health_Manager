import { StudentService } from '@/services/StudentService';
import { Student } from '@/models/Student';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  /**
   * 단일 학생 조회
   */
  async getStudentById(id: number): Promise<Student | null> {
    return await this.studentService.getStudentById(id);
  }

  /**
   * 모든 학생 조회 (필터링, 검색 지원)
   */
  async getStudents(params: {
    schoolType?: 'elementary' | 'middle' | 'high';
    grade?: number;
    searchTerm?: string;
    page: number;
    limit: number;
  }): Promise<{
    students: Student[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { schoolType, grade, searchTerm, page, limit } = params;
    
    // 학생 데이터 가져오기
    let filteredStudents: Student[] = [];
    
    if (schoolType && grade) {
      filteredStudents = await this.studentService.getStudentsBySchoolTypeAndGrade(schoolType, grade);
    } else if (schoolType) {
      filteredStudents = await this.studentService.getStudentsBySchoolType(schoolType);
    } else if (grade) {
      filteredStudents = await this.studentService.getStudentsByGrade(grade);
    } else {
      filteredStudents = await this.studentService.getAllStudents();
    }
    
    // 검색어로 필터링
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student => 
        student.name.includes(searchTerm) || 
        student.schoolName.includes(searchTerm) ||
        (student.parentName && student.parentName.includes(searchTerm))
      );
    }
    
    // 전체 카운트
    const totalCount = filteredStudents.length;
    
    // 페이지네이션 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const students = filteredStudents.slice(startIndex, endIndex);
    
    return {
      students,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * 학생 통계 조회
   */
  async getStudentStatistics(schoolType?: 'elementary' | 'middle' | 'high') {
    return await this.studentService.getStudentStatistics(schoolType);
  }

  /**
   * 새 학생 등록
   */
  async createStudent(studentData: Partial<Student>): Promise<Student | null> {
    // 필수 필드 검증
    if (!studentData.name || !studentData.schoolName || !studentData.gender || !studentData.schoolType) {
      throw new Error('필수 입력 항목이 누락되었습니다.');
    }

    return await this.studentService.createStudent(studentData);
  }

  /**
   * 학생 정보 업데이트
   */
  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | null> {
    return await this.studentService.updateStudent(id, studentData);
  }

  /**
   * 학생 삭제 (soft delete)
   */
  async deleteStudent(id: number): Promise<boolean> {
    return await this.studentService.deleteStudent(id);
  }

  /**
   * 학생 완전 삭제 (hard delete)
   */
  async hardDeleteStudent(id: number): Promise<boolean> {
    return await this.studentService.hardDeleteStudent(id);
  }
} 