import jwt from 'jsonwebtoken';
import { User } from '@/models/User';

// JWT 비밀 키 (실제 프로젝트에서는 환경변수에서 가져와야 함)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 기본 7일

// 사용자 정보에서 민감한 정보 제거
export function sanitizeUser(user: User) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

// 액세스 토큰 생성
export function generateAccessToken(user: User): string {
  const sanitizedUser = sanitizeUser(user);
  
  return jwt.sign(
    { user: sanitizedUser },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 토큰 검증
export function verifyToken(token: string): { user: Omit<User, 'password'> } | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as { user: Omit<User, 'password'> };
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return null;
  }
}

// 토큰에서 사용자 정보 추출
export function getUserFromToken(token: string): Omit<User, 'password'> | null {
  const decoded = verifyToken(token);
  return decoded ? decoded.user : null;
}

// 토큰에서 사용자 ID 추출
export function getUserIdFromToken(token: string): number | null {
  const user = getUserFromToken(token);
  return user ? user.id : null;
}

// 토큰의 만료 시간 계산 (초 단위)
export function getTokenExpiryInSeconds(): number {
  // 예: '7d'를 초로 변환
  const expiresIn = JWT_EXPIRES_IN;
  
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60; // 기본값 7일
    }
  }
  
  return typeof expiresIn === 'number' ? expiresIn : 7 * 24 * 60 * 60;
} 