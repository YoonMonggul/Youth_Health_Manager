import React from 'react';
import { X } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  schoolType: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  gender: 'male' | 'female';
  birthDate?: Date;
  parentName?: string;
  parentContact?: string;
}

interface ParticipantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  participants: Student[];
}

export default function ParticipantDetailModal({ 
  isOpen, 
  onClose, 
  programName, 
  participants 
}: ParticipantDetailModalProps) {
  // 학년별/성별 통계 계산
  const stats = React.useMemo(() => {
    const gradeCounts: Record<string, number> = {};
    const genderCounts = { male: 0, female: 0 };
    
    participants.forEach(student => {
      const gradeLabel = `${student.schoolType === 'elementary' ? '초' : student.schoolType === 'middle' ? '중' : '고'}${student.grade}`;
      gradeCounts[gradeLabel] = (gradeCounts[gradeLabel] || 0) + 1;
      
      if (student.gender === 'male') genderCounts.male++;
      else genderCounts.female++;
    });
    
    return { gradeCounts, genderCounts };
  }, [participants]);

  // 날짜 포맷팅
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-4xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {programName} - 참여자 상세보기
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {participants.length}명 참여
            </p>
          </div>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4">
          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-800">총 참여자</div>
              <div className="text-2xl font-bold text-blue-600">{participants.length}명</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-800">남학생</div>
              <div className="text-2xl font-bold text-green-600">{stats.genderCounts.male}명</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-3">
              <div className="text-sm font-medium text-pink-800">여학생</div>
              <div className="text-2xl font-bold text-pink-600">{stats.genderCounts.female}명</div>
            </div>
          </div>

          {/* 학년별 분포 */}
          {Object.keys(stats.gradeCounts).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">학년별 분포</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(stats.gradeCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => (
                    <div key={grade} className="bg-gray-100 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-gray-700">{grade}</span>
                      <span className="text-sm text-gray-500 ml-2">{count}명</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 참여자 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2 border border-gray-200">번호</th>
                  <th className="px-3 py-2 border border-gray-200">이름</th>
                  <th className="px-3 py-2 border border-gray-200">학년/반/번호</th>
                  <th className="px-3 py-2 border border-gray-200">성별</th>
                  <th className="px-3 py-2 border border-gray-200">생년월일</th>
                  <th className="px-3 py-2 border border-gray-200">보호자</th>
                  <th className="px-3 py-2 border border-gray-200">연락처</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((student, index) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-3 py-2 border border-gray-200 text-center">{index + 1}</td>
                    <td className="px-3 py-2 border border-gray-200 font-medium">{student.name}</td>
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      {student.grade}학년 {student.classNumber}반 {student.studentNumber}번
                    </td>
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      {student.gender === 'male' ? '남' : '여'}
                    </td>
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      {formatDate(student.birthDate)}
                    </td>
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      {student.parentName || '-'}
                    </td>
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      {student.parentContact || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 참여자가 없을 때 */}
          {participants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm font-medium">참여자가 없습니다</div>
              <div className="text-xs mt-1">프로그램에 참여하는 학생이 없습니다</div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            type="button"
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 