import React from 'react';
import { X, Search } from 'lucide-react';
import { Student } from '@/models/Student';

interface ProgramAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; startDate: string; endDate: string; description?: string; studentIds: number[] }) => Promise<void>;
  editingId: number | null;
  initialData?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    studentIds?: number[];
  };
}

export default function ProgramAddModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  initialData
}: ProgramAddModalProps) {
  // 프로그램 정보 상태
  const [formData, setFormData] = React.useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  // 전체 학생 목록
  const [students, setStudents] = React.useState<Student[]>([]);
  // 선택된 학생 목록 (여러 명)
  const [selectedStudents, setSelectedStudents] = React.useState<Student[]>([]);
  // 검색어
  const [searchTerm, setSearchTerm] = React.useState('');
  // 로딩 상태
  const [loading, setLoading] = React.useState(false);

  // initialData로 폼 및 선택 학생 초기화 (수정 모드)
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        description: initialData.description || ''
      });
      if (Array.isArray(initialData.studentIds) && initialData.studentIds.length > 0) {
        // 학생 목록을 불러온 후 선택된 학생 세팅
        setLoading(true);
        fetch(`/api/students`).then(res => res.json()).then(data => {
          setStudents(data.students);
          setSelectedStudents(data.students.filter((s: Student) => initialData.studentIds!.includes(s.id)));
        }).finally(() => setLoading(false));
      } else {
        setSelectedStudents([]);
      }
    }
    if (isOpen && !editingId) {
      setFormData({ name: '', startDate: '', endDate: '', description: '' });
      setSelectedStudents([]);
      setSearchTerm('');
    }
  }, [isOpen, initialData, editingId]);

  // 학생 목록 불러오기 (검색어 반영)
  React.useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('searchTerm', searchTerm);
        const response = await fetch(`/api/students?${params}`);
        if (!response.ok) throw new Error('학생 목록을 불러오는데 실패했습니다.');
        const data = await response.json();
        setStudents(data.students);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [searchTerm]);

  // 입력값 변경 핸들러
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // 학생 선택/해제 핸들러
  function handleStudentToggle(student: Student) {
    setSelectedStudents(prev => {
      const exists = prev.some(s => s.id === student.id);
      if (exists) {
        // 이미 선택된 경우 해제
        return prev.filter(s => s.id !== student.id);
      } else {
        // 새로 선택
        return [...prev, student];
      }
    });
  }

  // 선택된 학생 개별 해제
  function handleRemoveSelected(studentId: number) {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
  }

  // 제출 핸들러
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('프로그램명, 시작일, 종료일을 입력하세요.');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('학생을 한 명 이상 선택하세요.');
      return;
    }
    await onSubmit({
      ...formData,
      studentIds: selectedStudents.map(s => s.id)
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-3xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? '프로그램 수정' : '프로그램 등록'}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {/* 프로그램 정보 입력 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">프로그램명</label>
              <input
                name="name"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="프로그램명을 입력하세요"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">설명 (선택)</label>
              <input
                name="description"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="설명을 입력하세요"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">시작일</label>
              <input
                name="startDate"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">종료일</label>
              <input
                name="endDate"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* 학생 검색 및 선택 영역 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">학생 검색</label>
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                placeholder="학생 이름으로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {loading ? (
                <div className="p-2 text-center text-gray-500 text-xs">검색 중...</div>
              ) : students.length > 0 ? (
                students.map(student => (
                  <button
                    key={student.id}
                    type="button"
                    className={`w-full p-2 text-left flex items-center hover:bg-gray-100 text-xs border-b last:border-b-0 ${selectedStudents.some(s => s.id === student.id) ? 'bg-blue-50 font-bold' : ''}`}
                    onClick={() => handleStudentToggle(student)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.some(s => s.id === student.id)}
                      readOnly
                      className="mr-2"
                    />
                    <span>{student.name}</span>
                    <span className="mx-1">|</span>
                    <span>{student.grade}학년 {student.classNumber}반 {student.studentNumber}번</span>
                  </button>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500 text-xs">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>

          {/* 선택된 학생 목록 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">선택된 학생</label>
            {selectedStudents.length === 0 ? (
              <div className="text-xs text-gray-400">선택된 학생이 없습니다.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map(student => (
                  <span key={student.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {student.name} ({student.grade}-{student.classNumber}-{student.studentNumber})
                    <button
                      type="button"
                      className="ml-1 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSelected(student.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 등록/취소 버튼 */}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 text-center"
            >
              {editingId ? '수정' : '등록'}
            </button>
            <button
              type="button"
              className="ml-2 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-xs font-medium px-4 py-2"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 