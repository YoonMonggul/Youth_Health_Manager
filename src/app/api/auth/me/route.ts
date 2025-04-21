import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '../../../../controllers/AuthController';
import { initializeDatabase } from '../../../../database/data-source';

// 인증 컨트롤러 인스턴스
const authController = new AuthController();

/**
 * GET 요청 처리 - 현재 사용자 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 초기화 시도
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.error('데이터베이스 초기화 실패, 테스트 모드로 계속:', dbError);
      // 데이터베이스 초기화 실패해도 진행
    }
    
    // 요청 헤더에서 인증 토큰 추출
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('인증 토큰 없음 또는 잘못된 형식:', authHeader);
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' }, 
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('토큰 검증 시도:', token.substring(0, 10) + '...');
    
    // 토큰 검증
    const tokenData = await authController.verifyToken(token);
    
    if (!tokenData) {
      console.error('유효하지 않은 토큰');
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 토큰입니다.' }, 
        { status: 401 }
      );
    }
    
    console.log('토큰 검증 성공:', tokenData.userId);
    
    // 사용자 정보 조회
    const user = await authController.getCurrentUser(tokenData.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }
    
    // 응답 생성
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('사용자 정보 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: error.message || '사용자 정보 조회 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 