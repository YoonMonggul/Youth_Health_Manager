// Redis 클라이언트 실제 구현 대신 가짜(mock) 구현
// 개발 환경에서는 실제 Redis 서버 연결 없이 테스트할 수 있게 함

// 토큰 저장소 (실제 Redis 대신 메모리에 저장)
const tokenStore: Record<string, string> = {};

// Redis 연결 함수 (가짜)
export async function connectRedis() {
  console.log('가짜 Redis에 연결되었습니다 (실제 연결 없음).');
  return true;
}

// 토큰 저장
export async function setToken(userId: number, token: string, expiresIn: number): Promise<void> {
  console.log(`토큰 저장: userId=${userId}, 만료 시간=${expiresIn}초`);
  tokenStore[`auth:${userId}`] = token;
  
  // 실제 만료 시간 구현 (메모리에서만)
  if (expiresIn > 0) {
    setTimeout(() => {
      deleteToken(userId);
    }, expiresIn * 1000);
  }
}

// 토큰 가져오기
export async function getToken(userId: number): Promise<string | null> {
  const token = tokenStore[`auth:${userId}`];
  return token || null;
}

// 토큰 삭제 (로그아웃)
export async function deleteToken(userId: number): Promise<void> {
  console.log(`토큰 삭제: userId=${userId}`);
  delete tokenStore[`auth:${userId}`];
}

// 토큰 검증 (저장된 토큰과 비교)
export async function verifyTokenInRedis(userId: number, token: string): Promise<boolean> {
  const storedToken = await getToken(userId);
  console.log(`토큰 검증 시도: userId=${userId}, 토큰 존재 여부=${!!storedToken}`);
  
  // 개발 환경에서는 토큰이 없어도 검증 통과 (개발 편의성)
  if (process.env.NODE_ENV === 'development' && Object.keys(tokenStore).length === 0) {
    console.log('개발 환경: 토큰 스토어가 비어있어 검증 통과');
    return true;
  }
  
  return storedToken === token;
}

export default {
  connectRedis,
  setToken,
  getToken,
  deleteToken,
  verifyTokenInRedis
}; 