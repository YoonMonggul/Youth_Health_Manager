'use client';

import React from 'react';
import { X, Search } from 'lucide-react';
import moment from 'moment';
import { Growth } from '@/models/Growth';
import { Student } from '@/models/Student';

interface GrowthAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Growth>) => Promise<void>;
  editingId: number | null;
  initialData?: Partial<Growth>;
}

export default function GrowthAddModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  initialData = {}
}: GrowthAddModalProps) {
  const [formData, setFormData] = React.useState<Partial<Growth>>(initialData);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // 학생 목록 조회
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      
      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) throw new Error('학생 목록을 불러오는데 실패했습니다.');
      
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경시 학생 목록 갱신
  React.useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  // 모달이 열릴 때 초기화
  React.useEffect(() => {
    if (isOpen && !editingId) {
      setSelectedStudent(null);
      setSearchTerm("");
      fetchStudents();
    }
  }, [isOpen, editingId]);

  // initialData가 변경될 때 formData 업데이트
  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
      if (initialData.student) {
        setSelectedStudent(initialData.student as Student);
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBMI = (height: number, weight: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // 키나 몸무게가 변경될 때 BMI 자동 계산
  React.useEffect(() => {
    if (formData.height && formData.weight) {
      const bmi = calculateBMI(Number(formData.height), Number(formData.weight));
      setFormData(prev => ({ ...prev, bmi: Number(bmi) }));
    }
  }, [formData.height, formData.weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    const requiredFields = {
      height: '키',
      weight: '몸무게',
      measurementDate: '측정일'
    } as const;

    const missingFields = (Object.entries(requiredFields) as [keyof typeof requiredFields, string][])
      .filter(([key]) => !formData[key])
      .map(([, label]) => label);

    if (!selectedStudent && !editingId) {
      missingFields.push('학생');
    }

    if (missingFields.length > 0) {
      alert(`다음 필수 항목을 입력해주세요:\n${missingFields.join(', ')}`);
      return;
    }

    const submitData = {
      ...formData,
      studentId: selectedStudent?.id
    };

    await onSubmit(submitData);
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-full max-w-3xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? '성장 데이터 수정' : '성장 데이터 등록'}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {!editingId && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <label className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                    학생 선택
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                      placeholder="학생 이름으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {selectedStudent ? (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-semibold">{selectedStudent.name}</span>
                    <span className="mx-1">|</span>
                    <span>{selectedStudent.grade}학년 {selectedStudent.classNumber}반 {selectedStudent.studentNumber}번</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-800"
                    onClick={() => setSelectedStudent(null)}
                  >
                    선택 취소
                  </button>
                </div>
              ) : searchTerm && (
                <div className="mt-1 max-h-40 overflow-y-auto border rounded-lg">
                  {loading ? (
                    <div className="p-2 text-center text-gray-500 text-xs">
                      검색 중...
                    </div>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="w-full p-2 text-left hover:bg-gray-100 text-xs border-b last:border-b-0"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <span className="font-semibold">{student.name}</span>
                        <span className="mx-1">|</span>
                        <span>{student.grade}학년 {student.classNumber}반 {student.studentNumber}번</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500 text-xs">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="height" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                키 (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                step="0.1"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="키를 입력하세요"
                value={formData.height || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                몸무게 (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="몸무게를 입력하세요"
                value={formData.weight || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="bmi" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                BMI
              </label>
              <input
                id="bmi"
                name="bmi"
                type="number"
                step="0.1"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.bmi || ''}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="waistCircumference" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                허리둘레 (cm)
              </label>
              <input
                id="waistCircumference"
                name="waistCircumference"
                type="number"
                step="0.1"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="허리둘레를 입력하세요"
                value={formData.waistCircumference || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="measurementDate" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                측정일
              </label>
              <input
                type="date"
                id="measurementDate"
                name="measurementDate"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.measurementDate ? moment(formData.measurementDate).format('YYYY-MM-DD') : ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="note" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                특이사항
              </label>
              <textarea
                id="note"
                name="note"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="특이사항을 입력하세요"
                value={formData.note || ''}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button 
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 text-center"
            >
              {editingId ? "수정" : "등록"}
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