'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Heart, 
  BookOpen, 
  Users, 
  MessageSquare, 
  ClipboardCheck, 
  Settings,
  LineChart 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: '홈', path: '/', icon: Home },
    { name: '일정관리', path: '/schedule', icon: Calendar },
    { name: '건강관리', path: '/health', icon: Heart },
    { name: '교육자료', path: '/education', icon: BookOpen },
    { name: '대상자관리', path: '/students', icon: Users },
    { name: '성장 데이터', path: '/growth', icon: LineChart },
    { name: '메시지관리', path: '/messages', icon: MessageSquare },
    { name: '검진관리', path: '/checkups', icon: ClipboardCheck },
    { name: '설정', path: '/settings', icon: Settings }
  ];

  return (
    <div className="w-56 min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      {/* 로고 영역 */}
      <div className="p-4 mb-6 border border-dashed border-gray-600 text-center">
        <span className="text-xl font-bold">로고</span>
      </div>
      
      {/* 네비게이션 메뉴 */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-md hover:bg-gray-800 transition-colors ${
                    isActive ? 'bg-gray-800' : ''
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 