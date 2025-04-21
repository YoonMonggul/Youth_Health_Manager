import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증 확인이 필요 없는 페이지들
const publicPages = ['/login', '/register', '/forgot-password', '/api/auth/login'];

export function middleware(request: NextRequest) {
  // 현재 경로 가져오기
  const { pathname } = request.nextUrl;
  
  // API 요청은 여기서 처리하지 않고 각 API 라우트에서 처리
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // 인증이 필요 없는 페이지인지 확인
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // 인증 토큰 확인 (쿠키에서 확인)
  // 클라이언트 측에서 로컬 스토리지로 토큰을 관리하기 때문에 미들웨어에서는 체크하지 않음
  // 각 페이지 컴포넌트에서 useEffect를 사용해 인증 상태를 확인
  
  // 로그인 페이지의 경우 별도 처리 하지 않음
  if (pathname === '/login') {
    return NextResponse.next();
  }
  
  // 공개 페이지는 인증 체크 없이 접근 가능
  if (isPublicPage) {
    return NextResponse.next();
  }
  
  // 인증이 필요한 페이지는 클라이언트 사이드에서 체크
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  // '/'로 시작하는 모든 경로에 미들웨어 적용
  matcher: '/:path*',
}; 