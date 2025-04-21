import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/database/data-source';
import { StudentController } from '@/controllers/StudentController';

// 데이터베이스가 초기화되었는지 확인하는 함수
const ensureDatabaseInitialized = async () => {
  const isInitialized = await initializeDatabase();
  if (!isInitialized) {
    throw new Error('데이터베이스 연결 실패');
  }
};

// 학생 컨트롤러 인스턴스 생성
const studentController = new StudentController();

/**
 * GET 요청 처리 - 학생 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    // URL 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const schoolType = searchParams.get('schoolType') as 'elementary' | 'middle' | 'high' | null;
    const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : null;
    const id = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;
    const searchTerm = searchParams.get('searchTerm') || '';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const stats = searchParams.get('stats') === 'true';
    
    // 단일 학생 조회
    if (id) {
      const student = await studentController.getStudentById(id);
      if (!student) {
        return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json(student);
    }
    
    // 통계 요청 처리
    if (stats) {
      // 'null'을 'undefined'로 처리하여 타입 오류 해결
      const statistics = await studentController.getStudentStatistics(schoolType ?? undefined);
      return NextResponse.json(statistics);
    }
    
    // 학생 목록 조회 (필터링, 검색, 페이지네이션 적용)
    const result = await studentController.getStudents({
      schoolType: schoolType ?? undefined,
      grade: grade ?? undefined,
      searchTerm,
      page,
      limit
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('학생 조회 중 오류 발생:', error);
    return NextResponse.json({ error: error.message || '학생 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * POST 요청 처리 - 새 학생 등록
 */
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    // 요청 본문 파싱
    const studentData = await request.json();
    
    try {
      // 학생 생성
      const newStudent = await studentController.createStudent(studentData);
      if (!newStudent) {
        return NextResponse.json({ error: '학생 등록 실패' }, { status: 500 });
      }
      
      return NextResponse.json(newStudent, { status: 201 });
    } catch (validationError: any) {
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('학생 등록 중 오류 발생:', error);
    return NextResponse.json({ error: error.message || '학생 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * PUT 요청 처리 - 학생 정보 업데이트
 */
export async function PUT(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    // URL 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 });
    }
    
    // 요청 본문 파싱
    const studentData = await request.json();
    
    // 학생 업데이트
    const updatedStudent = await studentController.updateStudent(parseInt(id), studentData);
    if (!updatedStudent) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    console.error('학생 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json({ error: error.message || '학생 정보 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * DELETE 요청 처리 - 학생 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    // URL 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 });
    }
    
    // 학생 삭제 (hard 파라미터에 따라 soft/hard 삭제 선택)
    let success;
    if (hard) {
      success = await studentController.hardDeleteStudent(parseInt(id));
    } else {
      success = await studentController.deleteStudent(parseInt(id));
    }
    
    if (!success) {
      return NextResponse.json({ error: '학생을 찾을 수 없거나 삭제할 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('학생 삭제 중 오류 발생:', error);
    return NextResponse.json({ error: error.message || '학생 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 