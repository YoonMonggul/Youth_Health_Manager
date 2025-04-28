import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../../../models/User';
import { initDb } from '@/lib/db';

// JWT 비밀 키
const JWT_SECRET = process.env.JWT_SECRET || 'youth_health_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * 로그인 API 처리
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const data = await request.json();
    const { email, password } = data;
    
    console.log('받은 로그인 데이터:', { email, password: '***' });

    // 필수 필드 검증
    if (!email || !password) {
      console.log('필수 필드 누락');
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 데이터베이스 연결 시도
    console.log('데이터베이스 연결 시도...');
    const AppDataSource = await initDb();
    console.log('데이터베이스 연결 성공');
    
    // 이메일로 사용자 찾기
    console.log('사용자 검색 시도:', email);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'schoolType', 'schoolName']
    });
    console.log('사용자 검색 결과:', user ? '사용자 찾음' : '사용자 없음');

    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    console.log('비밀번호 검증 시도');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 검증 결과:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 민감한 정보 제거
    const { password: _, ...userWithoutPassword } = user;

    // JWT 토큰 생성
    console.log('JWT 토큰 생성 시도');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    console.log('JWT 토큰 생성 성공');

    // 로그인 성공 응답
    return NextResponse.json(
      {
        message: '로그인 성공',
        token,
        user: userWithoutPassword
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('로그인 처리 중 상세 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 