'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    const verifyAuth = async () => {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined') return;
      
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }
        
        // 토큰을 사용하여 현재 사용자 정보 확인
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        // 사용자 데이터 업데이트
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('인증 확인 에러:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, [router]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 환영 메시지 */}
      {user && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">안녕하세요, {user.name}님!</h1>
          <p className="text-gray-600">오늘도 학생들의 건강한 성장을 위해 힘써주셔서 감사합니다.</p>
        </div>
      )}

      {/* 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 일정 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">일정 관리</h2>
          <p className="text-gray-600 mb-4">오늘의 일정과 중요 이벤트를 확인하세요.</p>
          <button 
            onClick={() => router.push('/schedule')}
            className="flex items-center text-blue-600 font-medium hover:underline"
          >
            바로가기 <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* 대상자 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">대상자 관리</h2>
          <p className="text-gray-600 mb-4">학생 및 대상자 정보를 확인하고 관리하세요.</p>
          <button 
            onClick={() => router.push('/students')}
            className="flex items-center text-blue-600 font-medium hover:underline"
          >
            바로가기 <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 