import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '../../../../database/data-source';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../../../models/User';

// JWT 비밀 키
const JWT_SECRET = process.env.JWT_SECRET || 'youth_health_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * 로그인 API 처리
 */
export async function POST(request: NextRequest) {
  let isDBConnected = false;
  
  try {
    // 요청 데이터 파싱
    const data = await request.json();
    const { email, password } = data;

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('로그인 시도:', email);

    await AppDataSource.initialize();
    isDBConnected = true;
    console.log('로그인 API - 데이터베이스 연결 성공');

    // 이메일로 사용자 찾기
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'schoolType', 'schoolName']
    });

    if (!user) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 민감한 정보 제거
    const { password: _, ...userWithoutPassword } = user;

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
    console.error('로그인 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    if (isDBConnected && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
} 