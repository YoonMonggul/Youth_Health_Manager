'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'health_teacher';
  schoolType: 'elementary' | 'middle' | 'high';
  schoolName: string;
  phoneNumber: string;
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (error) {
        console.error('사용자 정보 파싱 에러:', error);
        router.push('/login');
      }
    }
  }, [router]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : null);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 실제 API 연동 전 로컬 스토리지 업데이트로 대체
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setMessage({ 
          type: 'success', 
          text: '사용자 정보가 성공적으로 업데이트되었습니다.' 
        });
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 에러:', error);
      setMessage({ 
        type: 'error', 
        text: '사용자 정보 업데이트 중 오류가 발생했습니다.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return <div className="p-6 text-center">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">사용자 설정</h1>
        <p className="text-gray-600">개인 정보 및 계정 설정을 관리합니다.</p>
      </div>

      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-gray-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 사용자 ID (수정 불가) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">사용자 ID</label>
              <input
                type="text"
                value={userData.id}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                value={userData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 역할 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-700">역할</label>
              <select
                id="role"
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="admin">관리자</option>
                <option value="teacher">교사</option>
                <option value="health_teacher">보건교사</option>
              </select>
            </div>

            {/* 학교 구분 */}
            <div>
              <label htmlFor="schoolType" className="block text-sm font-medium mb-1 text-gray-700">학교 구분</label>
              <select
                id="schoolType"
                name="schoolType"
                value={userData.schoolType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="elementary">초등학교</option>
                <option value="middle">중학교</option>
                <option value="high">고등학교</option>
              </select>
            </div>
            
            {/* 학교 이름 */}
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium mb-1 text-gray-700">학교 이름</label>
              <input
                id="schoolName"
                name="schoolName"
                type="text"
                value={userData.schoolName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 전화번호 */}
            <div className="md:col-span-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1 text-gray-700">전화번호</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={userData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* 저장 버튼 */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? '저장 중...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 개발용 디버그 정보 */}
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="text-sm font-medium mb-2">개발용 디버그 정보</h3>
        <pre className="text-xs overflow-auto bg-gray-800 text-gray-200 p-3 rounded">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SettingsPage; 