import React from 'react';
import { X, Search } from 'lucide-react';

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
  gender: 'male' | 'female';
}

interface Growth {
  id: number;
  height: number;
  weight: number;
  bmi: number;
  waistCircumference?: number;
  measurementDate: Date;
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
  
  // 건강구분 필터링 상태 추가
  const [activeHealthFilter, setActiveHealthFilter] = React.useState<string | null>(null);
  const [allStudentsGrowthData, setAllStudentsGrowthData] = React.useState<Record<number, Growth[]>>({});
  const [searchTerm, setSearchTerm] = React.useState('');

  // 모든 학생의 성장 데이터 가져오기
  const fetchAllStudentsGrowthData = async (studentList: Student[]) => {
    try {
      const growthDataMap: Record<number, Growth[]> = {};
      
      // 각 학생의 성장 데이터를 병렬로 가져오기
      const promises = studentList.map(async (student) => {
        try {
          const response = await fetch(`/api/growths?studentId=${student.id}&limit=5&sort=measurementDate,desc`);
          if (response.ok) {
            const data = await response.json();
            growthDataMap[student.id] = data.items || [];
          } else {
            growthDataMap[student.id] = [];
          }
        } catch (error) {
          console.error(`학생 ${student.id}의 성장 데이터 로딩 오류:`, error);
          growthDataMap[student.id] = [];
        }
      });
      
      await Promise.all(promises);
      setAllStudentsGrowthData(growthDataMap);
    } catch (error) {
      console.error('전체 학생 성장 데이터 로딩 오류:', error);
    }
  };

  // 건강 구분별 학생 필터링
  const filteredStudentsByHealth = React.useMemo(() => {
    if (!activeHealthFilter) return students;
    
    return students.filter(student => {
      const growthData = allStudentsGrowthData[student.id];
      if (!growthData || growthData.length === 0) {
        return activeHealthFilter === '데이터미등록';
      }

      const latestGrowth = growthData[0]; // 최신 데이터 사용
      const bmi = Number(latestGrowth.bmi);
      const waistCircumference = latestGrowth.waistCircumference ? Number(latestGrowth.waistCircumference) : null;
      const height = Number(latestGrowth.height);
      
      // BMI 기반 비만도 판정
      let bmiCategory = '';
      if (student.gender === 'male') {
        if (bmi < 14.7) bmiCategory = '저체중';
        else if (bmi < 21.2) bmiCategory = '정상체중';
        else if (bmi < 23.1) bmiCategory = '과체중';
        else bmiCategory = '비만';
      } else {
        if (bmi < 14.4) bmiCategory = '저체중';
        else if (bmi < 20.6) bmiCategory = '정상체중';
        else if (bmi < 22.4) bmiCategory = '과체중';
        else bmiCategory = '비만';
      }
      
      // 복부비만 판정
      let abdominalCategory = '';
      if (waistCircumference && height) {
        const ratio = waistCircumference / height;
        abdominalCategory = ratio < 0.43 ? '복부비만양호' : '복부비만의심';
      }
      
      // 필터링 조건 확인
      switch (activeHealthFilter) {
        case '저체중':
        case '정상체중':
        case '과체중':
        case '비만':
          return bmiCategory === activeHealthFilter;
        case '복부비만양호':
        case '복부비만의심':
          return abdominalCategory === activeHealthFilter;
        case '데이터미등록':
          return false; // 이미 위에서 처리됨
        default:
          return true;
      }
    });
  }, [students, activeHealthFilter, allStudentsGrowthData]);

  // 각 건강 구분별 인원수 계산
  const healthCategoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      '저체중': 0,
      '정상체중': 0,
      '과체중': 0,
      '비만': 0,
      '복부비만양호': 0,
      '복부비만의심': 0,
      '데이터미등록': 0
    };
    
    students.forEach(student => {
      const growthData = allStudentsGrowthData[student.id];
      if (!growthData || growthData.length === 0) {
        counts['데이터미등록']++;
        return;
      }

      const latestGrowth = growthData[0];
      const bmi = Number(latestGrowth.bmi);
      const waistCircumference = latestGrowth.waistCircumference ? Number(latestGrowth.waistCircumference) : null;
      const height = Number(latestGrowth.height);
      
      // BMI 기반 비만도 판정
      let bmiCategory = '';
      if (student.gender === 'male') {
        if (bmi < 14.7) bmiCategory = '저체중';
        else if (bmi < 21.2) bmiCategory = '정상체중';
        else if (bmi < 23.1) bmiCategory = '과체중';
        else bmiCategory = '비만';
      } else {
        if (bmi < 14.4) bmiCategory = '저체중';
        else if (bmi < 20.6) bmiCategory = '정상체중';
        else if (bmi < 22.4) bmiCategory = '과체중';
        else bmiCategory = '비만';
      }
      
      // 복부비만 판정
      if (waistCircumference && height) {
        const ratio = waistCircumference / height;
        const abdominalCategory = ratio < 0.43 ? '복부비만양호' : '복부비만의심';
        counts[abdominalCategory]++;
      }
      
      // BMI 카테고리 카운트
      counts[bmiCategory]++;
    });
    
    return counts;
  }, [students, allStudentsGrowthData]);

  // 검색 기능
  const filteredStudents = filteredStudentsByHealth.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      .then(data => {
        const studentList = data.students || [];
        setStudents(studentList);
        // 모든 학생의 성장 데이터 로드
        fetchAllStudentsGrowthData(studentList);
      });
  }, [isOpen]);

  // 모달이 닫힐 때 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedProgramId(null);
      setSelectedStudentIds([]);
      setStartDate('');
      setEndDate('');
      setProgramName('');
      setActiveHealthFilter(null);
      setSearchTerm('');
    }
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
      <div className="relative bg-white rounded-lg shadow w-full max-w-4xl mx-4 pointer-events-auto">
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
          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽: 프로그램 정보 */}
            <div>
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
            </div>

            {/* 오른쪽: 학생 선택 */}
            <div>
              <div className="mb-4">
                <label className="block mb-1 text-xs font-medium text-gray-900">학생 선택 (다중)</label>
                
                {/* 검색 */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 py-2 text-xs border border-gray-300 rounded-md bg-gray-50"
                    placeholder="학생 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* 건강구분 필터링 */}
                <div className="mb-2 bg-gray-100 rounded-md p-2 relative group">
                  <div className="flex justify-between items-center cursor-pointer">
                    <span className="text-xs font-medium">
                      {activeHealthFilter 
                        ? `${activeHealthFilter} (${filteredStudentsByHealth.length})`
                        : `전체 학생 (${students.length})`}
                    </span>
                    <span className="text-xs">▼</span>
                  </div>
                  
                  {/* 건강 구분 선택 드롭다운 */}
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                    <div 
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-xs"
                      onClick={() => setActiveHealthFilter(null)}
                    >
                      전체 학생 ({students.length})
                    </div>
                    {['저체중', '정상체중', '과체중', '비만', '복부비만양호', '복부비만의심', '데이터미등록'].map((category) => (
                      <div 
                        key={category}
                        className={`py-2 px-4 hover:bg-gray-100 cursor-pointer text-xs ${
                          activeHealthFilter === category ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setActiveHealthFilter(category)}
                      >
                        {category} ({healthCategoryCounts[category]})
                      </div>
                    ))}
                  </div>
                </div>

                {/* 학생 목록 */}
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                  {filteredStudents.length === 0 ? (
                    <div className="text-xs text-gray-400">
                      {searchTerm ? '검색 결과가 없습니다.' : '학생이 없습니다.'}
                    </div>
                  ) : filteredStudents.map(s => (
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
                
                {/* 선택된 학생 수 표시 */}
                {selectedStudentIds.length > 0 && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    선택된 학생: {selectedStudentIds.length}명
                  </div>
                )}
              </div>
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