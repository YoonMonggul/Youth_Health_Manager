import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '../../../../database/data-source';
import { User } from '../../../../models/User';
import * as bcrypt from 'bcrypt';

/**
 * 회원가입 API 처리
 */
export async function POST(request: NextRequest) {
  try {
    await AppDataSource.initialize();
    console.log('회원가입 API - 데이터베이스 연결 성공');

    // 요청 데이터 파싱
    const data = await request.json();
    const { email, password, name, role, schoolType, schoolName, phoneNumber } = data;

    // 필수 필드 검증
    if (!email || !password || !name || !role || !schoolType || !schoolName || !phoneNumber) {
      return NextResponse.json(
        { message: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 생성
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.name = name;
    user.role = role as 'admin' | 'teacher' | 'health_teacher';
    user.schoolType = schoolType as 'elementary' | 'middle' | 'high';
    user.schoolName = schoolName;
    user.phoneNumber = phoneNumber;

    // 데이터베이스에 저장
    await userRepository.save(user);
    console.log('사용자 등록 성공:', email);

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
} 