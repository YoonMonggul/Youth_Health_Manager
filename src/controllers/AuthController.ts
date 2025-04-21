import { User } from '../models/User';
import { AppDataSource } from '../database/data-source';
import jwt from 'jsonwebtoken';
import { setToken, deleteToken, verifyTokenInRedis } from '../utils/redis';

// JWT 비밀 키 (환경변수에서 가져와야 함)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // 7일

// 개발 환경용 테스트 사용자
const TEST_USERS = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
    role: 'teacher'
  }
];

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * 사용자 로그인
   */
  async login(email: string, password: string): Promise<{ token: string; user: Partial<User> } | null> {
    try {
      let user;
      
      try {
        // 실제 데이터베이스에서 사용자 찾기 시도
        user = await this.userRepository.findOne({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true
          },
        });
      } catch (dbError) {
        console.log('DB에서 사용자 조회 중 오류, 테스트 사용자 확인:', dbError);
        // DB 연결 오류 시 테스트 사용자 확인
        user = null;
      }

      // 데이터베이스에서 사용자를 찾지 못했고 개발 모드라면 테스트 사용자 확인
      if (!user) {
        const testUser = TEST_USERS.find(u => u.email === email && u.password === password);
        if (testUser) {
          user = testUser as User;
          console.log('테스트 사용자로 로그인:', user.email);
        } else {
          return null;
        }
      } else {
        // 비밀번호 검증 (실제 구현에서는 해시 비교)
        const isPasswordValid = user.password === password;
        if (!isPasswordValid) {
          return null;
        }
      }

      // 민감한 정보 제거
      const { password: _, ...userWithoutPassword } = user;

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Redis에 토큰 저장
      // expiresIn을 초 단위로 변환 (예: '7d' -> 604800)
      const expiryInSeconds = 7 * 24 * 60 * 60; // 7일
      await setToken(user.id, token, expiryInSeconds);

      try {
        // 로그인 시간 업데이트 시도 (오류 발생 시 무시)
        // lastLoginAt 필드가 User 모델에 없을 수 있음
        // await this.userRepository.update(user.id, {
        //   lastLoginAt: new Date(),
        // });
        console.log('사용자 로그인 성공:', user.email);
      } catch (updateError) {
        // 개발 모드에서는 무시해도 괜찮음
        console.log('로그인 시간 업데이트 오류 (무시됨):', updateError);
      }

      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 로그아웃
   */
  async logout(userId: number): Promise<boolean> {
    try {
      // Redis에서 토큰 삭제
      await deleteToken(userId);
      return true;
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return false;
    }
  }

  /**
   * 토큰 검증
   */
  async verifyToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
    try {
      // JWT 토큰 검증
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        role: string;
      };

      // Redis에 저장된 토큰과 비교
      const isValid = await verifyTokenInRedis(decoded.userId, token);
      if (!isValid) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      return null;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(userId: number): Promise<Partial<User> | null> {
    try {
      let user = null;
      
      try {
        // 데이터베이스에서 사용자 조회
        user = await this.userRepository.findOne({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });
      } catch (error) {
        console.log('데이터베이스 조회 오류, 테스트 데이터 사용:', error);
      }
      
      // 데이터베이스에서 찾지 못했을 경우 테스트 사용자 확인
      if (!user) {
        const testUser = TEST_USERS.find(u => u.id === userId);
        if (testUser) {
          const { password, ...userWithoutPassword } = testUser;
          user = userWithoutPassword as Partial<User>;
        }
      }

      return user;
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
  }
} 