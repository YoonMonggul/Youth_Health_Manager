'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, Bell } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('사용자 정보 파싱 에러:', error);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden p-2 mr-2">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">아동 청소년 성장관리 프로그램</h1>
        </div>
        
        <div className="flex items-center">
          <button className="p-2 mr-2 text-gray-500 hover:text-gray-700">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center p-2 rounded-full hover:bg-gray-100"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <User className="h-5 w-5 text-gray-600 mr-1" />
              {user && <span className="text-sm">{user.name}</span>}
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 