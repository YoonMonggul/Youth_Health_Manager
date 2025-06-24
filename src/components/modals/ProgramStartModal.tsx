import React from 'react';
import { X } from 'lucide-react';

interface Program {
  id: number;
  name: string;
}
interface Student {
  id: number;
  name: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  schoolType: string;
}

interface ProgramStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { programId: number; programName: string; studentIds: number[]; startDate: string; endDate: string }) => Promise<void>;
}

export default function ProgramStartModal({ isOpen, onClose, onSubmit }: ProgramStartModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [programName, setProgramName] = React.useState('');

  // 프로그램 목록 불러오기
  React.useEffect(() => {
    if (!isOpen) return;
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(data.programs || []));
  }, [isOpen]);

  // 학생 목록 불러오기
  React.useEffect(() => {
    if (!isOpen) return;
    fetch('/api/students?limit=9999')
      .then(res => res.json())
      .then(data => setStudents(data.students || []));
  }, [isOpen]);

  function handleStudentToggle(id: number) {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProgramId) {
      alert('프로그램을 선택하세요.');
      return;
    }
    if (!programName.trim()) {
      alert('프로그램 이름을 입력하세요.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert('학생을 한 명 이상 선택하세요.');
      return;
    }
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 입력하세요.');
      return;
    }
    setLoading(true);
    await onSubmit({ programId: selectedProgramId, programName: programName.trim(), studentIds: selectedStudentIds, startDate, endDate });
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-2xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">프로그램 시작</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {/* 프로그램 선택 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">프로그램 선택</label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              value={selectedProgramId ?? ''}
              onChange={e => setSelectedProgramId(Number(e.target.value))}
              required
            >
              <option value="">프로그램을 선택하세요</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* 프로그램 이름 입력 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">프로그램 이름</label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              placeholder="예: 1학년 1반 6월 비만 예방반"
              value={programName}
              onChange={e => setProgramName(e.target.value)}
              required
            />
          </div>
          {/* 학생 선택 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">학생 선택 (다중)</label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {students.length === 0 ? (
                <div className="text-xs text-gray-400">학생이 없습니다.</div>
              ) : students.map(s => (
                <label key={s.id} className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={() => handleStudentToggle(s.id)}
                  />
                  <span>{s.name} ({
                    s.schoolType === 'elementary' ? '초등' : s.schoolType === 'middle' ? '중등' : s.schoolType === 'high' ? '고등' : s.schoolType
                  } {s.grade}학년 {s.classNumber}반 {s.studentNumber}번)</span>
                </label>
              ))}
            </div>
          </div>
          {/* 프로그램 기간 입력 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">시작일</label>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">종료일</label>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-4 py-2 text-center"
              disabled={loading}
            >
              {loading ? '시작 중...' : '시작'}
            </button>
            <button
              type="button"
              className="ml-2 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-xs font-medium px-4 py-2"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 