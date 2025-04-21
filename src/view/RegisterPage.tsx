'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 회원가입 데이터 인터페이스
interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'admin' | 'teacher' | 'health_teacher';
  schoolType: 'elementary' | 'middle' | 'high';
  schoolName: string;
  phoneNumber: string;
}

// 회원가입 단계
const steps = [
  { title: '기본 정보' },
  { title: '학교 및 개인 정보' }
];

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 회원가입 데이터 상태
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'teacher',
    schoolType: 'elementary',
    schoolName: '',
    phoneNumber: ''
  });

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // 셀렉트 필드 변경 핸들러
  const handleSelectChange = (name: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (activeStep === 0) {
      // 첫 단계 유효성 검사
      if (!registerData.email || !registerData.password || !registerData.confirmPassword) {
        setError('모든 필드를 입력해주세요.');
        return;
      }
      if (registerData.password !== registerData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
    }
    
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setError('');
    }
  };

  // 회원가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 비밀번호 확인
      if (registerData.password !== registerData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }

      // 필수 필드 확인
      if (!registerData.email || !registerData.password || !registerData.name || 
          !registerData.role || !registerData.schoolName || !registerData.schoolType || 
          !registerData.phoneNumber) {
        setError('모든 필드를 입력해주세요.');
        setIsLoading(false);
        return;
      }

      // API 호출로 회원가입 요청
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          name: registerData.name,
          role: registerData.role,
          schoolType: registerData.schoolType,
          schoolName: registerData.schoolName,
          phoneNumber: registerData.phoneNumber
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      // 성공 시 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 단계별 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">이름</label>
              <input
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">역할</label>
              <select
                id="role"
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.role}
                onChange={(e) => handleSelectChange('role', e.target.value)}
                required
              >
                <option value="teacher">교사</option>
                <option value="health_teacher">보건교사</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div>
              <label htmlFor="schoolType" className="block text-sm font-medium mb-1">학교 구분</label>
              <select
                id="schoolType"
                name="schoolType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.schoolType}
                onChange={(e) => handleSelectChange('schoolType', e.target.value)}
                required
              >
                <option value="elementary">초등학교</option>
                <option value="middle">중학교</option>
                <option value="high">고등학교</option>
              </select>
            </div>
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium mb-1">학교 이름</label>
              <input
                id="schoolName"
                name="schoolName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.schoolName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">전화번호</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={registerData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-1/2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        
        {/* 단계 표시 */}
        <div className="mb-6">
          <div className="flex mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex-1">
                <div className={`flex items-center flex-col relative ${index > 0 ? 'ml-2' : ''}`}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1">{step.title}</span>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-4 w-full h-0.5 ${
                      activeStep > index ? 'bg-blue-600' : 'bg-gray-300'
                    }`} style={{ left: '50%', zIndex: -1 }}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* 단계별 폼 */}
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
        </form>
        
        {/* 로그인 링크 */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 