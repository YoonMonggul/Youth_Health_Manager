'use client';

import React from 'react';
import { X } from 'lucide-react';
import moment from 'moment';
import { Student } from '@/models/Student';

interface StudentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Student>) => Promise<void>;
  editingId: number | null;
  initialData?: Partial<Student>;
}

interface UserData {
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high';
}

export default function StudentAddModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  initialData = {}
}: StudentAddModalProps) {
  const [formData, setFormData] = React.useState<Partial<Student>>(initialData);

  // 컴포넌트 마운트 시 또는 editingId 변경 시 학교 정보 설정
  React.useEffect(() => {
    if (!editingId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as UserData;
          console.log('설정할 학교 정보:', {
            schoolName: user.schoolName,
            schoolType: user.schoolType
          });
          setFormData(prev => ({
            ...prev,
            schoolName: user.schoolName,
            schoolType: user.schoolType as 'elementary' | 'middle' | 'high'
          }));
        } catch (error) {
          console.error('사용자 정보 파싱 에러:', error);
        }
      }
    }
  }, [editingId]);

  // initialData가 변경될 때 formData 업데이트
  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 전체 formData 상세 로깅
    const currentFormData = {
      ...formData,
      schoolName: formData.schoolName,
      schoolType: formData.schoolType
    };
    console.log('제출할 전체 데이터 (상세):', {
      ...currentFormData,
      schoolName: currentFormData.schoolName, // 명시적으로 표시
      schoolType: currentFormData.schoolType  // 명시적으로 표시
    });
    
    // 필수 필드 검증
    const requiredFields = {
      name: '이름',
      birthDate: '생년월일',
      gender: '성별',
      grade: '학년',
      classNumber: '반',
      studentNumber: '번호',
      schoolName: '학교명',
      schoolType: '학교 유형'
    } as const;

    const missingFields = (Object.entries(requiredFields) as [keyof typeof formData, string][])
      .filter(([key]) => {
        // 각 필드 값을 자세히 로깅
        console.log(`${key} 필드 값 (상세):`, {
          value: formData[key],
          type: typeof formData[key]
        });
        
        if ((key === 'schoolName' || key === 'schoolType') && !editingId) {
          return false;
        }
        return !formData[key];
      })
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      alert(`다음 필수 항목을 입력해주세요:\n${missingFields.join(', ')}`);
      return;
    }

    await onSubmit(currentFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-full max-w-3xl pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? '학생 정보 수정' : '새 학생 등록'}
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="name" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="이름을 입력하세요"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="grade" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                학년
              </label>
              <select
                id="grade"
                name="grade"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.grade || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">학년을 선택하세요</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
                <option value="5">5학년</option>
                <option value="6">6학년</option>
              </select>
            </div>

            <div>
              <label htmlFor="classNumber" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                반
              </label>
              <input
                id="classNumber"
                name="classNumber"
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="반을 입력하세요"
                value={formData.classNumber || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="studentNumber" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                번호
              </label>
              <input
                id="studentNumber"
                name="studentNumber"
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="번호를 입력하세요"
                value={formData.studentNumber || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                성별
              </label>
              <select
                id="gender"
                name="gender"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.gender || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">성별을 선택하세요</option>
                <option value="male">남</option>
                <option value="female">여</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthDate" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                생년월일
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.birthDate ? moment(formData.birthDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateChange(new Date(e.target.value));
                  }
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="parentContact" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                보호자 연락처
              </label>
              <input
                id="parentContact"
                name="parentContact"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="보호자 연락처를 입력하세요"
                value={formData.parentContact || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="parentName" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                보호자 이름
              </label>
              <input
                id="parentName"
                name="parentName"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="보호자 이름을 입력하세요"
                value={formData.parentName || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="parentRelation" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                보호자 관계
              </label>
              <select
                id="parentRelation"
                name="parentRelation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={formData.parentRelation || ''}
                onChange={handleInputChange}
              >
                <option value="">보호자 관계를 선택하세요</option>
                <option value="father">부</option>
                <option value="mother">모</option>
                <option value="grandfather">조부</option>
                <option value="grandmother">조모</option>
                <option value="uncle">삼촌/외삼촌</option>
                <option value="aunt">고모/이모</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="col-span-3">
              <label htmlFor="address" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                주소
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="주소를 입력하세요"
                value={formData.address || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-span-3">
              <label htmlFor="note" className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
                특이사항 (선택)
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