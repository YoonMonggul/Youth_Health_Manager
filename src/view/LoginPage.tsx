'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 에러 메시지 초기화
    if (errors[name as keyof LoginData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 입력 검증
    const validationErrors: Partial<LoginData> = {};
    if (!formData.email) {
      validationErrors.email = '이메일을 입력해주세요';
    }
    if (!formData.password) {
      validationErrors.password = '비밀번호를 입력해주세요';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('로그인 요청:', formData);
      
      // API 호출하여 로그인 요청
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('로그인 응답 상태:', response.status, response.statusText);
      
      // 응답 타입 확인
      const contentType = response.headers.get('content-type');
      console.log('응답 콘텐츠 타입:', contentType);
      
      if (!response.ok) {
        // 에러 응답이 HTML인지 확인
        if (contentType && contentType.includes('text/html')) {
          const htmlText = await response.text();
          console.error('HTML 에러 응답:', htmlText.substring(0, 500) + '...');
          throw new Error('서버 에러가 발생했습니다. 관리자에게 문의하세요.');
        }
        
        // JSON 에러 메시지 파싱 시도
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || '로그인 실패');
        } catch (jsonError) {
          console.error('에러 응답 파싱 실패:', jsonError);
          throw new Error('서버 응답을 처리할 수 없습니다.');
        }
      }

      // 성공 응답 파싱
      try {
        const data = await response.json();
        console.log('로그인 성공 데이터:', data);
        
        if (!data.token || !data.user) {
          throw new Error('유효하지 않은 응답 데이터입니다.');
        }
        
        // 인증 토큰을 로컬 스토리지에 저장
        localStorage.setItem('auth_token', data.token);
        
        // 사용자 정보 저장
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('로그인되었습니다.');
        
        // 토큰이 저장된 후 잠시 대기한 다음 홈페이지로 이동
        setTimeout(() => {
          router.push('/');
        }, 500);
      } catch (jsonError) {
        console.error('응답 데이터 파싱 실패:', jsonError);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }
    } catch (error: any) {
      console.error('로그인 에러:', error);
      setErrors({ email: error.message || '로그인 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium mb-1">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full border border-gray-300 bg-white text-gray-700 py-2 rounded-md hover:bg-gray-50"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 