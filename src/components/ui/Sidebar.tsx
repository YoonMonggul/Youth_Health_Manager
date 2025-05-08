'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Heart, 
  BookOpen, 
  Users, 
  Settings,
  LineChart,
  Database,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  UserCircle,
  Users2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(true);
  const [isHealthManagementOpen, setIsHealthManagementOpen] = useState(true);

  const menuItems = [
    { name: '홈', path: '/', icon: Home },
    { name: '일정관리', path: '/schedule', icon: Calendar },
    { name: '교육자료', path: '/education', icon: BookOpen },
    { name: '설정', path: '/settings', icon: Settings }
  ];

  const healthManagementItems = [
    { name: '개별관리', path: '/health/individual', icon: UserCircle },
    { name: '그룹관리', path: '/health/group', icon: Users2 }
  ];

  const dataManagementItems = [
    { name: '학생관리', path: '/students', icon: Users },
    { name: '성장관리', path: '/growth', icon: LineChart },
    { name: '검진관리', path: '/health-checkups', icon: Stethoscope }
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

          {/* 건강관리 메뉴 */}
          <li>
            <button
              onClick={() => setIsHealthManagementOpen(!isHealthManagementOpen)}
              className={`w-full flex items-center p-3 rounded-md hover:bg-gray-800 transition-colors ${
                pathname.startsWith('/health') ? 'bg-gray-800' : ''
              }`}
            >
              <Heart className="mr-3 h-5 w-5" />
              <span>건강관리</span>
              {isHealthManagementOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {isHealthManagementOpen && (
              <ul className="mt-2 ml-4 space-y-2">
                {healthManagementItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={`flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors ${
                          isActive ? 'bg-gray-800' : ''
                        }`}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* 데이터 관리 메뉴 */}
          <li>
            <button
              onClick={() => setIsDataManagementOpen(!isDataManagementOpen)}
              className="w-full flex items-center p-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Database className="mr-3 h-5 w-5" />
              <span>데이터 관리</span>
              {isDataManagementOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {isDataManagementOpen && (
              <ul className="mt-2 ml-4 space-y-2">
                {dataManagementItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={`flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors ${
                          isActive ? 'bg-gray-800' : ''
                        }`}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 