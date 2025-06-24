"use client";
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Search, Eye, Trash2 } from 'lucide-react';

interface ProgramEnd {
  id: number;
  programName: string;
  startDate: string;
  endDate: string;
  endedAt: string;
  reason: string;
  studentCount: number;
}

const MOCK_PROGRAMS: ProgramEnd[] = [
  {
    id: 1,
    programName: '초1 비만예방반',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    endedAt: '2024-05-01',
    reason: '프로그램 종료',
    studentCount: 18
  },
  {
    id: 2,
    programName: '중2 허리둘레관리',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    endedAt: '2024-06-01',
    reason: '정상 종료',
    studentCount: 22
  },
  {
    id: 3,
    programName: '고1 건강증진',
    startDate: '2024-05-01',
    endDate: '2024-06-30',
    endedAt: '2024-07-01',
    reason: '참여 저조',
    studentCount: 15
  }
];

export default function ProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [programs, setPrograms] = useState<ProgramEnd[]>(MOCK_PROGRAMS);

  // 검색 필터
  const filtered = programs.filter(p =>
    p.programName.includes(searchTerm)
  );

  // 삭제 핸들러
  function handleDelete(id: number) {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPrograms(prev => prev.filter(p => p.id !== id));
    }
  }

  // 상세 핸들러
  function handleDetail(id: number) {
    alert('상세보기: ' + id);
  }

  return (
    <Layout pageTitle="프로그램 관리">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold">종료된 프로그램 목록</div>
        <button className="px-4 py-2 text-white bg-blue-700 rounded-lg text-sm opacity-50 cursor-not-allowed" disabled>
          프로그램 등록
        </button>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative mr-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 pl-10 p-2.5"
            placeholder="프로그램명 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto relative">
        <table className="w-full text-xs text-left text-gray-500 border-collapse border border-gray-300">
          <thead className="text-[10px] text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-32">프로그램명</th>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-24">운영기간</th>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-20">종료일</th>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-32">종료사유</th>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-20">참여학생</th>
              <th className="py-1.5 px-3 text-center border border-gray-300 w-24">관리</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id} className="bg-white">
                <td className="py-2 px-3 text-center border border-gray-300 font-medium">{p.programName}</td>
                <td className="py-2 px-3 text-center border border-gray-300">{p.startDate} ~ {p.endDate}</td>
                <td className="py-2 px-3 text-center border border-gray-300">{p.endedAt}</td>
                <td className="py-2 px-3 text-center border border-gray-300">{p.reason}</td>
                <td className="py-2 px-3 text-center border border-gray-300">{p.studentCount}명</td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 mr-1" onClick={() => handleDetail(p.id)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />상세
                  </button>
                  <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />삭제
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">종료된 프로그램이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
} 