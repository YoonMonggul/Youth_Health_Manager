import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '../../../../controllers/AuthController';
import { initializeDatabase } from '../../../../database/data-source';

// 인증 컨트롤러 인스턴스
const authController = new AuthController();

/**
 * POST 요청 처리 - 로그아웃
 */
export async function POST(request: NextRequest) {
  try {
    // 데이터베이스 초기화 시도
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.error('데이터베이스 초기화 실패, 테스트 모드로 계속:', dbError);
      // 데이터베이스 초기화 실패해도 진행
    }
    
    // 요청 본문 파싱
    const { userId } = await request.json();
    
    // 필수 필드 검증
    if (!userId) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자입니다.' }, 
        { status: 400 }
      );
    }
    
    // 로그아웃 처리
    const success = await authController.logout(parseInt(userId));
    
    if (!success) {
      return NextResponse.json(
        { error: '로그아웃 처리 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 응답 생성
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('로그아웃 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: error.message || '로그아웃 처리 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 